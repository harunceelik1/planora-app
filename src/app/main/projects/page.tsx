"use client";
import { ProjectInitialization } from "@/features/components/project/project-initialization";
import useSWR from "swr";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { ProjectList } from "@/features/components/project/project-list";
import { Button } from "@/components/ui/button";
import Home from "../page";

/**
 * fetcher (Veri Çekici) Fonksiyonu
 * useSWR'a veriyi NASIL çekeceğini söyleyen yardımcı bir fonksiyondur.
 * API'den 'ok' olmayan bir yanıt gelirse (401, 404, 500 gibi) hata fırlatır.
 */
const fetcher = async (url: string) => {
  const res = await fetch(url);
  // throw new Error(
  //   "Bu bir test hatasıdır! Tasarımı kontrol etmek için eklendi."
  // );
  if (!res.ok) {
    const errorData = await res.json();
    // API'den gelen özel hata mesajını (örn: "Lütfen Giriş Yapın.") fırlat
    throw new Error(errorData.error || "Veri çekilirken bir hata oluştu.");
  }

  // Başarılıysa JSON verisini döndür
  console.log("Projeler başarıyla çekildi.", res);
  return res.json();
};

/**
 * Ana Projects Sayfası
 */
export default function Projects() {
  // 2. useSWR hook'unu kullanarak API rotanızdan veriyi çekin
  // SWR, '/api/project' URL'ini 'fetcher' fonksiyonuna parametre olarak gönderir.
  const {
    data: projects,
    error,
    isLoading,
  } = useSWR(
    "/api/project", // Bu, sizin GET fonksiyonunuzun olduğu API yoludur
    fetcher,
    {
      revalidateOnFocus: true, // Kullanıcı sekmeye geri döndüğünde veriyi tazeler
    }
  );

  // 3. Yüklenme durumu: Veri henüz gelmedi
  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-col h-screen">
        <Spinner className="size-8" />
      </div>
    );
  }

  // 4. Hata durumu: API bir hata döndürdü
  if (error) {
    // Hata mesajını daha iyi biçimlendirmek için
    const errorMessage = error.message || "Bilinmeyen bir hata oluştu.";

    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border border-red-200 dark:border-red-800/50">
          {/* Hata Başlığı */}
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center">
            Veri Yüklenemedi
          </h2>

          <p className="text-base text-gray-700 dark:text-gray-300 mb-6">
            {errorMessage}
          </p>

          {/* Genellikle 401 hatası (Giriş Yapılmamış) için yönlendirme yaparız. */}
          {errorMessage.includes("Giriş Yapın") ? (
            <Link href="/auth/sign-in" passHref>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Şimdi Giriş Yap
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.reload()} // Sayfayı yenileme denemesi
            >
              Tekrar Dene
            </Button>
          )}

          {/* Destek Metni */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
            Sorun devam ederse lütfen yöneticinizle iletişime geçin.
          </p>
        </div>
      </div>
    );
  }

  // 5. Veri başarıyla geldi (projects), şimdi koşullu render yapabiliriz
  return (
    <>
      {/* projects && projects.length > 0 
        -> 'projects' verisi varsa VE içinde en az 1 eleman varsa
      */}
      {projects && projects.length > 0 ? (
        // Proje varsa: ProjectList bileşenini göster
        // <ProjectList projects={projects} />
        <ProjectList projects={projects} />
      ) : (
        // Proje listesi boşsa veya 'projects' 'undefined' ise:
        // ProjectInitialization (ilk proje oluşturma) bileşenini göster
        <Home />
      )}
    </>
  );
}
