import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Session } from "next-auth";
import type { Subtask } from "@/types/shared";

type Body = {
  title: string;
  projectId: string;
  sprintId?: string | null;
  locale?: string | null;
};

// ─── In-memory cache (aynı title için tekrar AI çağrısı yapılmaz) ───────────
const subtaskCache = new Map<string, { tasks: Subtask[]; expiresAt: number }>();

// Simple in-memory rate limiters (production: use Redis/Upstash)
const USER_RATE_LIMIT = { points: 6, windowMs: 60 * 1000 }; // 6 requests per minute
const IP_RATE_LIMIT = { points: 20, windowMs: 60 * 60 * 1000 }; // 20 requests per hour per IP

const userRateMap = new Map<string, { count: number; reset: number }>();
const ipRateMap = new Map<string, { count: number; reset: number }>();

import { checkRateLimit } from "@/lib/rateLimiter";
import { decomposeBodySchema, parseSafe } from "@/lib/validation";

// Note: For production use prefer `zod` schemas. To avoid adding the dependency here,
// we run a small runtime validation helper.
function validateBody(raw: any) {
  if (!raw || typeof raw !== "object") return { ok: false, reason: "Invalid body" };
  const title = raw.title;
  const projectId = raw.projectId;
  const sprintId = raw.sprintId ?? null;
  const locale = raw.locale ?? null;
  if (typeof title !== "string" || title.trim().length === 0) return { ok: false, reason: "Invalid title" };
  if (typeof projectId !== "string" || projectId.trim().length === 0) return { ok: false, reason: "Invalid projectId" };
  return { ok: true, data: { title: title.trim(), projectId: projectId.trim(), sprintId, locale } };
}

function getCachedSubtasks(title: string): Subtask[] | null {
  const key = title.toLowerCase().trim();
  const entry = subtaskCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    subtaskCache.delete(key);
    return null;
  }
  return entry.tasks;
}

function setCachedSubtasks(title: string, tasks: Subtask[]): void {
  const key = title.toLowerCase().trim();
  subtaskCache.set(key, {
    tasks,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 dakika
  });
}

// ─── Fallback: API çöktüğünde veya rate limit bittiğinde kullanılır ──────────
function fallbackDecompose(title: string): Subtask[] {
  return [
    {
      title: `${title} — Ön Yüz Tasarımı`,
      area: "Frontend",
      description: "UI bileşenlerinin oluşturulması ve stillendirilmesi",
      storyPoints: 3,
    },
    {
      title: `${title} — API Geliştirme`,
      area: "Backend",
      description: "Gerekli endpoint ve iş mantığının yazılması",
      storyPoints: 3,
    },
    {
      title: `${title} — Veritabanı Şeması`,
      area: "Database",
      description: "Gerekli tablo / model değişikliklerinin yapılması",
      storyPoints: 2,
    },
  ];
}

// ─── Yardımcı: belirli ms kadar bekle ────────────────────────────────────────
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ─── Ana Handler ──────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  // 1. Oturum kontrolü
  const session: Session | null = await getServerSession(authOptions as any);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit — user
  const userKey = session.user.id || session.user.email;
  if (userKey) {
    const userCheck = await checkRateLimit(String(userKey), USER_RATE_LIMIT.points, USER_RATE_LIMIT.windowMs);
    if (userCheck.limited) {
      const retryAfter = Math.ceil((userCheck.reset - Date.now()) / 1000);
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
    }
  }

  // Rate limit — IP (best-effort; may be undefined in some hosting)
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const ipCheck = await checkRateLimit(ip, IP_RATE_LIMIT.points, IP_RATE_LIMIT.windowMs);
  if (ipCheck.limited) {
    const retryAfter = Math.ceil((ipCheck.reset - Date.now()) / 1000);
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
  }

  // 2. Body parse + validation
  const rawBody = await req.json();
  const parsed = parseSafe(decomposeBodySchema, rawBody);
  if (!parsed.ok) return NextResponse.json({ error: "Invalid request body", details: parsed.error }, { status: 400 });
  const { title, projectId, sprintId, locale } = parsed.data;

  // 3. Proje ve kullanıcı kontrolü
  const [projectExists, user] = await Promise.all([
    db.project.findUnique({ where: { id: projectId } }),
    db.user.findUnique({ where: { email: session.user.email } }),
  ]);

  if (!projectExists || !user) {
    return NextResponse.json(
      { error: "Project or User not found" },
      { status: 404 }
    );
  }

  // 4. AI ile alt görev üretimi
  let subtasks: Subtask[] = [];
  let usedCache = false;
  let usedFallback = false;

  const apiKey = process.env.GOOGLE_GEMINI_KEY;

  if (!apiKey) {
    // API key yoksa sessizce fallback kullan
    console.warn("GOOGLE_GEMINI_KEY tanımlı değil, fallback kullanılıyor.");
    subtasks = fallbackDecompose(title);
    usedFallback = true;
  } else {
    // Önce cache'e bak
    const cached = getCachedSubtasks(title);
    if (cached) {
      subtasks = cached;
      usedCache = true;
    } else {
      // AI çağrısı
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const lang = locale?.startsWith("tr") ? "Türkçe" : "İngilizce";
      const prompt = `Sen uzman bir Scrum/Agile yazılım proje yöneticisisin.

Görev: "${title}"

Bu görevi analiz et ve görevin GERÇEK doğasına göre 3-4 alt göreve böl.

Kurallar:
- Eğer görev sadece veritabanıyla ilgiliyse (örn: "tablo tasarla", "şema oluştur", "indeks ekle") → sadece Database ve Backend alt görevleri üret, Frontend ekleme
- Eğer görev sadece UI/UX ile ilgiliyse (örn: "sayfa tasarla", "bileşen yap") → sadece Frontend alt görevleri üret
- Eğer görev full-stack ise → gerekli tüm katmanları ekle
- Her alt görevin başlığı spesifik ve eyleme dönük olsun ("${title} için Frontend" YAZMA, ne yapılacağını yaz)
- Alt görevler birbirini tekrar etmesin, her biri farklı bir iş parçasını kapssın
- storyPoints: görevin karmaşıklığına göre 1-8 arası belirle

Alan seçenekleri: Frontend, Backend, Database, DevOps, Testing, Design

Çıktı olarak SADECE JSON döndür, başka hiçbir şey yazma:
[
  {
    "title": "Spesifik ve eyleme dönük başlık",
    "area": "Frontend|Backend|Database|DevOps|Testing|Design",
    "description": "Ne yapılacağının kısa açıklaması",
    "storyPoints": 3
  }
]`;

      const MAX_RETRIES = 3;
      // Backoff: 2s → 4s → 8s
      const getBackoff = (attempt: number) =>
        2000 * Math.pow(2, attempt) + Math.floor(Math.random() * 500);

      let lastError: unknown = null;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const result = await model.generateContent(prompt);
          const responseText = result?.response?.text
            ? await result.response.text()
            : String(result);

          // JSON'ı temizle (bazen model ```json ``` bloğu ekleyebilir)
          const cleaned = responseText
            .replace(/```json\s*/gi, "")
            .replace(/```\s*/gi, "")
            .trim();

          const parsed = JSON.parse(cleaned);

          if (!Array.isArray(parsed) || parsed.length === 0) {
            console.error("AI beklenmedik format döndürdü:", responseText);
            // Fallback'e düş, hata fırlatma
            usedFallback = true;
            subtasks = fallbackDecompose(title);
            break;
          }

          subtasks = parsed as Subtask[];
          setCachedSubtasks(title, subtasks); // Cache'e kaydet
          break; // ✅ Başarı

        } catch (err: unknown) {
          lastError = err;
          const message = String((err as Error)?.message || String(err || "")).toLowerCase();
          const errAny = err as any;

          // 404 → model yok, retry etme, direkt fallback
          if (errAny?.status === 404) {
            console.error("Model bulunamadı:", errAny.message || message);
            subtasks = fallbackDecompose(title);
            usedFallback = true;
            break;
          }

          const isRateLimit =
            message.includes("429") ||
            message.includes("quota") ||
            message.includes("rate") ||
            errAny?.status === 429;
          if (isRateLimit) {
            if (attempt < MAX_RETRIES - 1) {
              const backoff = getBackoff(attempt);
              console.warn(
                `AI rate limit — ${attempt + 1}/${MAX_RETRIES}. deneme, ${backoff}ms bekleniyor...`
              );
              await sleep(backoff);
              continue;
            } else {
              // Tüm denemeler bitti → fallback
              console.warn("AI rate limit tükendi, fallback kullanılıyor.");
              subtasks = fallbackDecompose(title);
              usedFallback = true;
              break;
            }
          }

          // Rate limit dışı hata (network, parse vs.) → direkt fallback
          console.error("AI hatası (tekrar denenemiyor):", err);
          subtasks = fallbackDecompose(title);
          usedFallback = true;
          break;
        }
      }

      // Döngü bitti ama subtasks hâlâ boşsa son güvence
      if (subtasks.length === 0) {
        console.warn("subtasks boş kaldı, son fallback tetiklendi.");
        subtasks = fallbackDecompose(title);
        usedFallback = true;
      }
    }
  }

  // 5. Veritabanına kaydet — transaction ile atomik numara atama
  try {
    const createdIssues = await db.$transaction(async (tx) => {
      const lastIssue = await tx.issue.findFirst({ where: { projectId }, orderBy: { number: "desc" } });
      const lastOrderIssue = await tx.issue.findFirst({ where: { projectId, sprintId: sprintId || null }, orderBy: { order: "desc" } });

      let nextNumber = (lastIssue?.number || 0) + 1;
      let nextOrder = (lastOrderIssue?.order || 0) + 1;

      const created: any[] = [];

      for (const task of subtasks) {
        const issue = await tx.issue.create({
          data: {
            title: task.title || task.area || "Untitled",
            description: task.description || null,
            storyPoints: task.storyPoints || null,
            projectId,
            number: nextNumber,
            order: nextOrder,
            status: "TODO",
            priority: "MEDIUM",
            sprintId: sprintId || null,
            reporterId: user.id,
          },
        });
        created.push(issue);
        nextNumber++;
        nextOrder++;
      }

      await tx.project.update({ where: { id: projectId }, data: { updatedAt: new Date() } });

      return created;
    });

    revalidatePath(`/main/projects/${projectId}`);

    return NextResponse.json({ success: true, createdCount: createdIssues.length, subtasks, meta: { usedCache, usedFallback } });
  } catch (error) {
    console.error("Veritabanı kayıt hatası:", error);
    return NextResponse.json({ error: "Could not create subtasks in database" }, { status: 500 });
  }
}