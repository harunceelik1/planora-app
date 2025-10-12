"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChartArea, ArrowRight, Users } from "lucide-react"; // Loader2 = spinner ikon
import { Spinner } from "@/components/ui/spinner";

export default function HomePage() {
  const router = useRouter();
  const { status } = useSession(); // "loading" | "authenticated" | "unauthenticated"

  // Eğer giriş yapmışsa dashboard'a yönlendir
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // Loading aşamasında spinner göster
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <Spinner className="size-8" />
      </div>
    );
  }
  return (
    <main className="relative flex flex-col justify-start min-h-screen text-gray-800 px-8 ">
      {/* <div className="circlePosition w-[50%] h-[50%] bg-[#6177f8da] rounded-[100%] absolute z-[-1] top-[40%] left-[20%] -translate-x-1/2 -translate-y-1/2 blur-[180px]" /> */}
      <section className="max-w-2xl pt-18 mb-24">
        <h1 className="text-[90px] font-extrabold leading-none tracking-tight">
          Planla Ve Yönet
        </h1>
        <p className="mt-6 text-lg opacity-70 text-gray-600">
          Planora ile projelerini planla, yönet ve ekibinle iş birliği içinde
          çalış.
        </p>

        <Button
          className="mt-8 px-6 py-3 text-white rounded-lg flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/sign-up")}
        >
          Get Started
          <ArrowRight />
        </Button>
      </section>
      <section className="w-full h-[50%] border-t border-black pt-12 flex justify-between text-gray-700">
        <div className="flex items-start gap-4 w-1/3 px-4 border-r border-black">
          <div className="p-2 rounded-full">
            <ChartArea size={22} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Zaman Çizelgesi</h3>
            <p className="text-sm text-gray-500">
              Teslim tarihlerini ve önemli kilometre taşlarını zaman çizelgesi
              üzerinden takip et.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 w-1/3 px-4 border-r border-black">
          <div className="p-2 rounded-full">
            <CalendarDays size={22} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Görev Yönetimi</h3>
            <p className="text-sm text-gray-500">
              Görev oluştur, ata ve ilerlemeyi takip et. Ekibindeki herkesin ne
              yaptığını kolayca gör.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 w-1/3 px-4">
          <div className="p-2 rounded-full">
            <Users size={22} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Ekip İş Birliği</h3>
            <p className="text-sm text-gray-500">
              Ekibinle gerçek zamanlı çalış, görevleri paylaş ve bildirimlerle
              iletişimi güçlendir.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
