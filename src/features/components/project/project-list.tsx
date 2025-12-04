"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react"; // Sadece SearchIcon kaldı
import { DataTable } from "./project-data/data-table";
import { columns } from "./project-data/columns";
import { useState } from "react";
import { Project } from "@/types/project";

export const ProjectList = ({ projects }: { projects: Project[] }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const filteredProjects = projects.filter((project) => {
    // Arama terimini ve proje verilerini küçük harfe çevir (Büyük/Küçük harf duyarlılığını kaldırmak için)
    // Türkçe karakter desteği için toLocaleLowerCase('tr') kullanıyoruz.
    const searchLower = searchTerm.toLocaleLowerCase("tr");

    const nameMatch = project.projectName
      ?.toLocaleLowerCase("tr")
      .includes(searchLower);
    const keyMatch = project.projectKey
      ?.toLocaleLowerCase("tr")
      .includes(searchLower);

    // İsimde VEYA Anahtarda (Key) eşleşme varsa true döner
    return nameMatch || keyMatch;
  });

  return (
    <main className="p-8 h-screen gap-6 flex flex-col">
      <nav className="flex flex-col gap-4">
        {/* Üst Başlık ve Proje Oluştur Butonu */}
        <div className="flex justify-between ">
          <h1 className="text-3xl font-semibold ">Alan</h1>
          <Button
            variant={"default"}
            onClick={() => {
              router.push("/main/create-project");
            }}
          >
            Proje Oluştur
          </Button>
        </div>

        {/* SADECE ARAMA ÇUBUĞU KALDI */}
        <div className="w-fit flex flex-row justify-center items-center gap-2">
          {/* Genel Proje Arama Inputu (Local) */}
          <InputGroup>
            <InputGroupInput
              placeholder="Search..."
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
          {/* DataTable, artık 'columns.tsx' içinde User Ekleme butonunu çağıracak */}
          <DataTable columns={columns} data={filteredProjects} />
        </div>
      </section>
    </main>
  );
};
