"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // Shadcn Button
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Shadcn Card
import { ArrowRight, ListChecks, LogIn, Mail, ChartColumn } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { FcGoogle } from "react-icons/fc";

// Kaydırma fonksiyonu
const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

export default function HomePage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <Spinner className="size-8" />
      </div>
    );
  }

  // Kart Verileri
  const featureCards = [
    {
      title: "Zaman Çizelgesi",
      subTitle: "Projelerinizi Vaktinde Teslim Edin",
      icon: ChartColumn,
      slug: "zaman-cizelgesi",
      shortDescription:
        "Gantt şemaları ile her görevin başlangıç ve bitişini görsel olarak planlayın.", // KISA AÇIKLAMA
      longDescription:
        "Planora'nın gelişmiş Zaman Çizelgesi aracı, projelerinizi A'dan Z'ye görselleştirmenizi sağlar. Kritik yolu kolayca belirleyerek darboğazları önleyin ve projelerinizin zamanında, hatasız tamamlanmasını garanti altına alın.", // UZUN AÇIKLAMA
      bgColor: "bg-[#0b2e59]", // Koyu lacivert
      subTextColor: "text-gray-100",
      reverse: false,
    },
    {
      title: "Görev Yönetimi",
      subTitle: "Her Görevi Kontrol Altında Tutun",
      icon: ListChecks,
      slug: "gorev-yonetimi",
      shortDescription:
        "Kanban, liste ve takvim görünümleriyle tüm görevlerinizi farklı açılardan kontrol edin.", // KISA AÇIKLAMA
      longDescription:
        "Proje ihtiyaçlarınıza göre Kanban panoları, liste veya takvim görünümleri arasında anında geçiş yapın. Görevleri alt görevler, öncelikler, etiketler ve atamalarla detaylandırarak hiçbir ayrıntıyı kaçırmayın.", // UZUN AÇIKLAMA
      bgColor: "bg-indigo-50", // Açık mavi/gri
      subTextColor: "text-gray-700",
      reverse: true,
    },
    {
      title: "Hesap Yönetimi",
      subTitle: "Google veya Manuel Giriş",
      icon: LogIn,
      slug: "hesap-yonetimi",
      shortDescription:
        "Hızlı başlangıç için Google ile tek tıkla giriş veya geleneksel e-posta ile kayıt.", // KISA AÇIKLAMA
      longDescription:
        "Hesap Yönetimi modülü, size iki esnek giriş seçeneği sunar: En yüksek güvenlik standartlarına sahip Google hesabınızla anında giriş yapabilir ya da geleneksel e-posta ve parola yöntemiyle kolayca bir hesap oluşturabilirsiniz.", // UZUN AÇIKLAMA
      bgColor: "bg-[#0b2e59]", // Koyu lacivert
      subTextColor: "text-gray-100",
      reverse: true,
    },
  ];

  return (
    <main className="relative flex flex-col min-h-screen text-gray-800">
      {/* 1. HERO VE KARTLAR BÖLÜMÜ (Beyaz Arka Plan) */}
      <section className="flex flex-col lg:flex-row gap-12 py-20 lg:py-32 bg-white px-4 md:px-8 lg:px-16">
        {/* ... Hero İçeriği ... */}
        <div className="lg:w-5/12 flex flex-col justify-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-none tracking-tight">
            Planla Ve Yönet
          </h1>
          <p className="mt-6 max-w-xl text-lg md:text-xl text-gray-600">
            Planora, projelerini hızla planlamanı, verimli bir şekilde yönetmeni
            ve ekibinle kesintisiz iş birliği yapmanı sağlayan hepsi bir arada
            bir platformdur. Karmaşık süreçleri sadeleştirir, böylece
            hedeflerine daha kolay ve etkili bir şekilde ulaşmanı sağlar.
          </p>
          <Button
            className="mt-8 px-8 py-4 w-fit gap-2   shadow-md hover:shadow-lg transition-all duration-500 ease-in-out"
            onClick={() => router.push("/sign-up")}
          >
            Hemen Başlayın
            <ArrowRight className="size-4" />
          </Button>
        </div>
        {/* ... Özellik Kartları (Küçük olanlar) */}
        <div className="lg:w-7/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-12 lg:pt-0">
          {featureCards.map((card, index) => (
            <Card
              key={index}
              className="flex flex-col w-full h-full border-2 
                           shadow-lg transition-all duration-500 ease-in-out 
                           hover:border-primary hover:shadow-2xl hover:-translate-y-1"
            >
              <CardHeader className="flex flex-col space-y-4 p-6 border-b">
                <div className="p-4 rounded-full bg-primary/10 text-primary w-fit">
                  <card.icon size={32} />
                </div>
                <CardTitle className="text-2xl font-extrabold tracking-tight">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-start justify-between p-6 h-full">
                {/* KISA AÇIKLAMA KULLANILDI */}
                <p className="text-lg text-gray-600">{card.shortDescription}</p>
                <Button
                  variant="ghost"
                  className="mt-4 px-0 h-auto font-semibold text-base text-primary hover:bg-transparent hover:text-primary/80 transition-colors"
                  onClick={() => scrollToSection(card.slug + "-detay")}
                >
                  Daha Fazla Bilgi
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 2. DETAYLI AÇIKLAMA BÖLÜMÜ */}
      {featureCards.map((card, index) => (
        <section
          key={index}
          id={card.slug + "-detay"}
          className={`${card.bgColor} w-full py-20 md:py-32 overflow-hidden relative`}
        >
          {/* İçerik, sayfa kenar boşluklarını korumak için max-w-7xl içine alındı */}
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10 px-4 md:px-8 lg:px-0">
            {/* SOL/SAĞ TARAF: GÖRSEL ALANI */}
            <div
              className={`lg:w-1/2 flex items-center justify-center ${
                card.reverse ? "lg:order-2" : "lg:order-1"
              } `}
            >
              {card.slug === "hesap-yonetimi" ? (
                // HESAP YÖNETİMİ: OVERLAP'Lİ ÇİFT KARTLI YAPI
                <div className="flex w-full relative py-12 px-6">
                  {/* Sol Kart - Google Girişi */}
                  <div
                    className={`w-1/2 h-96 rounded-3xl border flex flex-col items-center justify-center p-6 
                            bg-gray-800 text-gray-200 border-gray-800 shadow-xl z-0
                            lg:translate-x-[-4px]`}
                  >
                    <div className="flex flex-col items-center">
                      <FcGoogle size={64} className="mb-4" />
                      <span className="text-xl font-semibold text-white text-center">
                        Google İle Giriş
                      </span>
                      <p className="text-sm text-center text-gray-400 mt-2">
                        Hızlı başlangıç
                      </p>
                    </div>
                  </div>

                  {/* Sağ Kart - Manuel Giriş (Kayıt) - Üstte duran kart */}
                  <div
                    className={`w-1/2 h-96 bg-white p-6 rounded-3xl flex flex-col items-center justify-center text-center z-10 
                            border border-gray-300 shadow-xl
                            lg:-translate-x-16`}
                  >
                    <Mail size={48} className="text-primary mb-4" />
                    {/* KAYIT YAZISI text-5xl'e küçültüldü */}
                    <span className="text-5xl font-extrabold text-gray-900 leading-none">
                      Kayıt
                    </span>
                    <p className="text-sm text-gray-600 mt-2">
                      E-posta & Parola
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 w-full max-w-md">
                  <card.icon
                    size={160}
                    className={`
                            ${
                              card.bgColor === "bg-[#0b2e59]"
                                ? "text-white/80"
                                : "text-primary/80"
                            } 
                        `}
                  />
                </div>
              )}
            </div>
            {/* SAĞ/SOL TARAF: İçerik (Metinler) */}
            <div
              className={`lg:w-1/2 flex flex-col items-start text-left ${
                card.reverse ? "lg:order-1" : "lg:order-2"
              } `}
            >
              <h2
                className={`text-5xl md:text-6xl font-extrabold leading-tight mb-6 ${
                  card.bgColor === "bg-[#0b2e59]"
                    ? "text-white"
                    : "text-gray-800"
                }`}
              >
                {card.title}
              </h2>
              <p
                className={`text-xl leading-relaxed ${card.subTextColor} mb-8`}
              >
                {card.longDescription}
              </p>
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
