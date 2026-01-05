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
// 👇 1. Dil destekli Router
import { useRouter } from "@/i18n/routing";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ROUTES } from "@/constants/routest";
import { useCreateProject } from "@/hooks/useCreateProject";
// 👇 2. Translation importu
import { useTranslations } from "next-intl";

const CreateProjectPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  // 👇 3. Hook'u başlat
  const t = useTranslations("CreateProject");

  const [projectName, setProjectName] = useState("");
  const [projectKey, setProjectKey] = useState("");
  const fakeRows = [1, 2, 3, 4, 5];
  const [errors, setErrors] = useState({ projectName: "", projectKey: "" });

  const { createProject, isLoading, apiError } = useCreateProject();

  const handleCreateProject = async () => {
    const newErrors = { projectName: "", projectKey: "" };
    let isValid = true;

    if (projectName.trim() === "") {
      newErrors.projectName = "error"; // Hata durumunu işaretle (Mesajı render kısmında t() ile alacağız)
      isValid = false;
    }
    if (projectKey.trim() === "") {
      newErrors.projectKey = "error";
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
            onClick={() => router.push(ROUTES.PROJECTS.LIST)}
            variant="ghost"
            className="ml-4 mt-4 opacity-50"
          >
            <ArrowLeft size={24} />
            <p className="opacity-70">{t("nav.back")}</p> {/* Çeviri */}
          </Button>
        </div>
      </nav>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 items-center gap-8 p-8">
        {/* Sol Taraf: Form */}
        <div className="flex flex-col justify-center w-full max-w-md mx-auto">
          <div className="gap-4 flex flex-col">
            <h1 className="text-3xl font-bold">{t("header.title")}</h1>{" "}
            {/* Çeviri */}
            <p className="mt-2 text-muted-foreground">
              {t("header.description")} {/* Çeviri */}
            </p>
            <div className="w-full space-y-4">
              {/* Ad Alanı */}
              <div className="">
                <div className="flex gap-1">
                  <Label htmlFor="ad" className="mb-1 font-medium">
                    {t("form.nameLabel")} {/* Çeviri */}
                  </Label>
                  <span className="text-red-500">*</span>
                </div>
                <Input
                  id="ad"
                  type="text"
                  placeholder={t("form.namePlaceholder")} // Çeviri
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
                      {t("errors.nameRequired")} {/* Çeviri */}
                    </p>
                  </div>
                )}
              </div>

              {/* Anahtar Alanı */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Label htmlFor="anahtar" className="font-medium">
                    {t("form.keyLabel")} {/* Çeviri */}
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
                          {t("popover.title")} {/* Çeviri */}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t("popover.description")}
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
                      {t("errors.keyRequired")} {/* Çeviri */}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 ">
                <Label htmlFor="anahtar" className="font-medium opacity-50">
                  {t("form.requiredNote")} {/* Çeviri */}
                </Label>
                <span className="text-red-500">*</span>
              </div>

              <div className="flex items-center gap-1.5 justify-end">
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    router.push(ROUTES.PROJECTS.LIST);
                  }}
                >
                  {t("form.cancelButton")} {/* Çeviri */}
                </Button>
                <Button
                  className="mt-4"
                  onClick={() => {
                    handleCreateProject();
                  }}
                >
                  {t("form.createButton")} {/* Çeviri */}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Taraf: Önizleme */}
        <div className="hidden md:flex flex-col items-center justify-center gap-4">
          <div className="w-full max-w-lg h-auto bg-white dark:bg-gray-900 shadow-2xl rounded-lg border overflow-hidden">
            {/* 1. Sahte Başlık Çubuğu */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-b">
              <div className="flex items-center gap-2 ">
                <Folder size={18} className="text-blue-500" />
                <span className="font-semibold w-48 min-w-0 text-ellipsis overflow-hidden whitespace-nowrap ">
                  {projectName || t("preview.defaultName")} {/* Çeviri */}
                </span>
              </div>
              <Avatar>
                <AvatarImage
                  src={session?.user?.image || ""}
                  className="object-cover rounded-full"
                />
              </Avatar>
            </div>

            {/* 2. Sahte Ana İçerik Alanı */}
            <div className="flex">
              <div className="w-16 p-3 bg-gray-100 dark:bg-gray-800/50 flex flex-col items-center gap-4 pt-4">
                <div className="h-6 w-6 rounded bg-blue-500" />
                <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-700" />
              </div>

              <div className="flex-1 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {t("preview.tasksTitle")} {/* Çeviri */}
                </h3>
                {fakeRows.map((item) => (
                  <div key={item} className="flex items-center gap-3 w-full">
                    <span className="w-20 min-w-0 font-mono text-sm text-gray-500 overflow-hidden whitespace-nowrap text-ellipsis">
                      {projectKey || t("preview.defaultKey")}-{item}{" "}
                      {/* Çeviri */}
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
