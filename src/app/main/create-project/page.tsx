"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, Info, Folder, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ROUTES } from "@/constants/routest";
import { useCreateProject } from "@/hooks/useCreateProject";

const CreateProjectPage = () => {
  const { data: session } = useSession();

  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [projectKey, setProjectKey] = useState("");
  const fakeRows = [1, 2, 3, 4, 5];
  const [errors, setErrors] = useState({ projectName: "", projectKey: "" });

  const { createProject, isLoading, apiError } = useCreateProject();

  const handleCreateProject = async () => {
    // Sadece client-side validation burada kalır
    const newErrors = { projectName: "", projectKey: "" };
    let isValid = true;
    if (projectName.trim() === "") {
      newErrors.projectName = "Proje adı gereklidir.";
      isValid = false;
    }
    if (projectKey.trim() === "") {
      newErrors.projectKey = "Proje anahtarı gereklidir.";
      isValid = false;
    }
    setErrors(newErrors);

    if (isValid) {
      await createProject({ name: projectName, projectKey: projectKey });
    }
  };

  return (
    <section className="h-screen flex flex-col">
      <nav>
        <div>
          <Button
            onClick={() => router.push("/main/projects")}
            variant="ghost"
            className="ml-4 mt-4 opacity-50"
          >
            <ArrowLeft size={24} />
            <p className="opacity-70">Geri Dön</p>
          </Button>
        </div>
      </nav>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 items-center gap-8 p-8">
        {/* Sol Taraf: Form (Değişiklik yok) */}
        <div className="flex flex-col justify-center w-full max-w-md mx-auto">
          <div className="gap-4 flex flex-col">
            <h1 className="text-3xl font-bold">Yeni Proje Oluştur</h1>
            <p className="mt-2 text-muted-foreground">
              Projeye başlamak için aşağıdaki alanları doldurunuz.
            </p>
            <div className="w-full space-y-4">
              {/* Ad Alanı */}
              <div className="">
                <div className="flex  gap-1">
                  <Label htmlFor="ad" className="mb-1 font-medium">
                    Ad
                  </Label>
                  <span className="text-red-500">*</span>
                </div>
                <Input
                  id="ad"
                  type="text"
                  placeholder="Takım adı, proje amacı, proje ismi..."
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);
                    if (errors.projectName) {
                      setErrors((prev) => ({ ...prev, projectName: "" }));
                    }
                  }}
                  className={errors.projectName ? "border-red-500" : ""}
                />
                {errors.projectName && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <TriangleAlert className="text-red-400" size={16} />
                    <p className="text-red-400 text-xs">
                      Yeni Projeniz için bir ad girmeniz gerekmektedir.
                    </p>
                  </div>
                )}
              </div>
              {/* Anahtar Alanı */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Label htmlFor="anahtar" className="font-medium">
                    Anahtar
                  </Label>
                  <span className="text-red-500">*</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full"
                      >
                        <Info size={14} className="text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="grid gap-4">
                        <h4 className="font-medium leading-none">
                          Proje Anahtarı Nedir?
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Proje anahtarı, projenizdeki tüm kayıtlar için
                          kullanılacak kısa ve benzersiz bir tanımlayıcıdır.
                          (Örn: GP, TEST)
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  id="anahtar"
                  type="text"
                  placeholder=""
                  value={projectKey}
                  onChange={(e) => {
                    setProjectKey(e.target.value.toUpperCase());
                    if (errors.projectKey) {
                      setErrors((prev) => ({ ...prev, projectKey: "" }));
                    }
                  }}
                  className={errors.projectName ? "border-red-500" : ""}
                />
                {errors.projectKey && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <TriangleAlert className="text-red-400" size={16} />
                    <p className="text-red-400 text-xs">
                      Alanınızın bir anahtarı olması gerekir.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 ">
                <Label htmlFor="anahtar" className="font-medium opacity-50">
                  Gerekli alanlar yıldız işaretiyle belirtilmiştir
                </Label>
                <span className="text-red-500">*</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    router.push(ROUTES.PROJECTS.LIST);
                    // projectName === "";
                  }}
                >
                  İptal{" "}
                </Button>
                <Button
                  className="mt-4"
                  onClick={() => {
                    // Proje oluşturma işlemi burada gerçekleşir (API çağrısı vb.)
                    // router.push(ROUTES.PROJECTS.LIST);
                    handleCreateProject();
                  }}
                >
                  Proje Oluştur
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-center justify-center gap-4">
          <div className="w-full max-w-lg h-auto bg-white dark:bg-gray-900 shadow-2xl rounded-lg border overflow-hidden">
            {/* 1. Sahte Başlık Çubuğu (Proje Adını kullanır) */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-b">
              <div className="flex items-center gap-2 ">
                <Folder size={18} className="text-blue-500" />
                <span className="font-semibold w-48 min-w-0 text-ellipsis overflow-hidden whitespace-nowrap ">
                  {projectName || "Proje Adı"}
                </span>
              </div>
              <Avatar>
                <AvatarImage
                  src={session?.user?.image || ""}
                  className="object-cover rounded-full"
                />
              </Avatar>
            </div>

            {/* 2. Sahte Ana İçerik Alanı (Sidebar + Liste) */}
            <div className="flex">
              {/* Sahte Sidebar */}
              <div className="w-16 p-3 bg-gray-100 dark:bg-gray-800/50 flex flex-col items-center gap-4 pt-4">
                <div className="h-6 w-6 rounded bg-blue-500" />{" "}
                {/* Aktif menü */}
                <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-700" />
              </div>

              {/* Sahte Görev Listesi (Satırlar) (Proje Anahtarını kullanır) */}
              <div className="flex-1 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Proje Görevleri
                </h3>
                {fakeRows.map((item) => (
                  <div key={item} className="flex items-center gap-3 w-full">
                    <span className="w-20 min-w-0 font-mono text-sm text-gray-500 overflow-hidden whitespace-nowrap text-ellipsis">
                      {projectKey || "KEY"}-{item}
                    </span>
                    <div className="h-4 flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-5 w-16 bg-blue-100 dark:bg-blue-900 rounded" />
                    <div className="h-5 w-5 rounded-full bg-gray-300 dark:bg-gray-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
};

export default CreateProjectPage;
