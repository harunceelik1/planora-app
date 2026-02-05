"use client";

import { Button } from "@/components/ui/button";
// 👇 1. Dil destekli Router (Önemli: Linkler bozulmasın diye)
import { useRouter } from "@/i18n/routing";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react";
import { DataTable } from "./project-data/data-table";
import { getColumns } from "./project-data/columns";
import { useState } from "react";
import { Project } from "@/types/project";
import { ROUTES } from "@/constants/routest";
import { useTranslations } from "next-intl";

export const ProjectList = ({ projects }: { projects: Project[] }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // 👇 2. Hook zaten ekliydi, doğru yerden çekiyor.
  const t = useTranslations("ProjectList");

  // columns dizisini t fonksiyonunu vererek oluşturuyoruz
  const columns = getColumns(t);

  const filteredProjects = projects.filter((project) => {
    // Not: "tr" parametresi hardcoded kalabilir,
    // ancak çok dilli yapıda kullanıcının aktif diline göre davranması daha doğru olur.
    // Şimdilik filtreleme mantığını değiştirmiyoruz.
    const searchLower = searchTerm.toLocaleLowerCase("tr");

    const nameMatch = project.projectName
      ?.toLocaleLowerCase("tr")
      .includes(searchLower);
    const keyMatch = project.projectKey
      ?.toLocaleLowerCase("tr")
      .includes(searchLower);

    return nameMatch || keyMatch;
  });

  return (
    <main className="p-8 h-screen gap-6 flex flex-col ">
      <nav className="flex flex-col gap-4">
        {/* Üst Başlık ve Proje Oluştur Butonu */}
        <div className="flex justify-between ">
          <h1 className="text-3xl font-semibold ">
            {t("title")} {/* Çeviri: Alan / Workspace */}
          </h1>
          <Button
            variant={"default"}
            onClick={() => {
              router.push(ROUTES.CREATE_PROJECT);
            }}
          >
            {t("createButton")} {/* Çeviri: Proje Oluştur */}
          </Button>
        </div>

        {/* Arama Çubuğu */}
        <div className="w-fit flex flex-row justify-center items-center gap-2">
          <InputGroup>
            <InputGroupInput
              placeholder={t("searchPlaceholder")} // Çeviri: Proje ara...
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </nav>

      {/* Proje Tablosu */}
      <section className="">
        <div className="">
          <DataTable columns={columns} data={filteredProjects} />
        </div>
      </section>
    </main>
  );
};
