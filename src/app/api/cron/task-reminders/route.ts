import { NextResponse } from "next/server";
import { processDueTaskReminders } from "@/lib/notifications";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const configuredSecret = process.env.CRON_SECRET;

  if (!configuredSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 500 },
    );
  }

  if (authHeader !== `Bearer ${configuredSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processDueTaskReminders();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Task reminder cron failed:", error);
    return NextResponse.json(
      { error: "Task reminder processing failed." },
      { status: 500 },
    );
  }
}


export async function GET() {
  try {
    const results = await processDueTaskReminders();
    
    // Tarayıcıya sonuçları yazdır
    return NextResponse.json({
      success: true,
      message: "Bildirim taraması tamamlandı!",
      data: results
    });
  } catch (error) {
    console.error("Cron hatası:", error);
    return NextResponse.json({ success: false, error: "Bir hata oluştu" }, { status: 500 });
  }
}