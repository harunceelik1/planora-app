"use client";
import { ProjectInitialization } from "@/features/components/project/project-initialization";
import useSWR from "swr";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { ProjectList } from "@/features/components/project/project-list";

/**
 * fetcher (Veri Çekici) Fonksiyonu
 * useSWR'a veriyi NASIL çekeceğini söyleyen yardımcı bir fonksiyondur.
 * API'den 'ok' olmayan bir yanıt gelirse (401, 404, 500 gibi) hata fırlatır.
 */
const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const errorData = await res.json();
    // API'den gelen özel hata mesajını (örn: "Lütfen Giriş Yapın.") fırlat
    throw new Error(errorData.error || "Veri çekilirken bir hata oluştu.");
  }

  // Başarılıysa JSON verisini döndür
  console.log("Projeler başarıyla çekildi.", res);
  return res.json();
};

// const ProjectList = ({ projects }: { projects: any[] }) => {
//   return (
//     <div className="p-8 max-w-4xl mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Projelerim</h1>
//         <Link
//           href="/main/create-project"
//           className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
//         >
//           Yeni Proje Oluştur
//         </Link>
//       </div>
//       <ul className="space-y-4">
//         {projects.map((project) => (
//           <li
//             key={project.id}
//             className="p-5 border rounded-lg shadow-sm bg-card text-card-foreground"
//           >
//             <h2 className="text-xl font-semibold text-primary">
//               {project.projectName}
//             </h2>
//             <p className="text-sm text-muted-foreground mt-1">
//               Anahtar:{" "}
//               <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
//                 {project.projectKey}
//               </span>
//             </p>
//             <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
//               <span>{project._count.members} Üye</span>
//               <span>{project._count.issues} Görev</span>
//             </div>
//             {/* Buraya projeye giden bir link ekleyebilirsiniz
//             <Link href={`/projects/${project.id}`} className="text-blue-500 mt-2 inline-block">
//               Projeye Git
//             </Link>
//             */}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

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
    // Örneğin, 401 (giriş yapılmamış) hatası yakalanırsa
    return (
      <div className="p-8 text-center text-red-500">Hata: {error.message}</div>
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
        <ProjectInitialization />
      )}
    </>
  );
}
