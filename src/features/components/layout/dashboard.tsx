import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { CircleCheck } from "lucide-react";
import Link from "next/link";

export const DashboardPageContent = () => {
  const { data: session } = useSession();

  return (
    // Tailwind CSS sınıfları ile şık bir container
    <div className="min-h-screen  flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="">
        {/* Başlık ve karşılama mesajı */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
            Merhaba, {session?.user.name || "Kullanıcı"}!
          </h1>
          <p className=" opacity-50 font-mono">Kontrol Paneline Hoş Geldin.</p>
        </div>

        {/* Ana içerik bölümü */}
        <div className="space-y-6">
          <div className="bg-indigo-50 border-l-4 p-4 rounded-md">
            <div className="flex items-center">
              <CircleCheck className=" w-6 h-6 mr-3" />
              <p className="  text-md">
                Burada proje ve ekibini oluşturabilir, yeni görevler
                atayabilirsin.
              </p>
            </div>
          </div>

          {/* Aksiyon Butonları (Örnek) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Link href="/main/create-project">
              <Button className="p-8 w-full" variant={"default"}>
                Yeni Proje Oluştur
              </Button>
            </Link>
            <Button className="p-8" variant={"outline"}>
              Ekibini Yönet
            </Button>
          </div>
        </div>

        <Separator className="my-8" />
        <p className="text-sm text-center text-gray-500">
          Tüm işlemlerin anlık olarak güncellenmektedir. İyi çalışmalar!
        </p>
      </div>
    </div>
  );
};
