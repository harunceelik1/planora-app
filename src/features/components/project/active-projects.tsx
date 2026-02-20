"use client";

import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Clock, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Project } from "@/types/project";

interface ActiveProjectsProps {
  projects: Project[];
}

export function ActiveProjects({ projects }: ActiveProjectsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("tr-TR", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <div className="flex flex-col gap-4">
        {projects.slice(0, 3).map((project) => {
          // İlerleme Durumu (Şimdilik statik)
          const calculatedProgress = 45;

          return (
            <div
              key={project.id}
              className="group relative bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Üst Kısım: İkon ve İsim */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* --- BURASI GÜNCELLENDİ: PROJE GÖRSELİ --- */}
                  {/* 'rounded-xl' ile hafif kare yaptık, boyutunu büyüttük */}
                  <Avatar className="w-12 h-12 rounded-xl border-2 border-border ring-0">
                    {/* Projenin kendi görseli varsa göster */}
                    {/* NOT: project.image alanının Project tipinde tanımlı olduğundan emin ol */}
                    <AvatarImage
                      src={project.image}
                      alt={project.projectName}
                      className="object-cover rounded-xl" // İçindeki resmin de köşeleri uysun
                    />

                    {/* Görsel yoksa baş harfi göster (Bu da kare olacak) */}
                    <AvatarFallback className="rounded-xl text-lg font-semibold bg-primary/10 text-primary uppercase">
                      {project.projectName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h4 className="font-semibold text-sm text-foreground line-clamp-1 leading-tight">
                      {project.projectName}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                      {project.projectKey}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>İlerleme</span>
                  <span className="text-foreground">{calculatedProgress}%</span>
                </div>
                <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500 bg-primary", // Varsayılan primary renk
                    )}
                    style={{ width: `${calculatedProgress}%` }}
                  />
                </div>
              </div>

              {/* Alt Kısım: Members ve Tarih */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                {/* Members (Aynen kaldı) */}
                <div className="flex -space-x-2">
                  {project.members.slice(0, 2).map((member) => (
                    <Avatar
                      key={member.id}
                      className="w-6 h-6 border-2 border-background ring-0"
                    >
                      <AvatarImage
                        src={member.user.image}
                        alt={member.user.name}
                      />
                      <AvatarFallback className="text-[9px] bg-muted text-muted-foreground font-medium">
                        {member.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {project.members.length > 2 && (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-background bg-muted text-[9px] text-muted-foreground font-medium pl-0.5">
                      +{project.members.length - 2}
                    </div>
                  )}
                  {project.members.length === 0 && (
                    <div className="text-[10px] text-muted-foreground italic pl-1">
                      Üye yok
                    </div>
                  )}
                </div>

                {/* Tarih */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(project.updatedAt)}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Yeni Ekle Butonu */}
        <Link href="/main/create-project">
          <div className="w-full flex items-center justify-center gap-2 border border-dashed border-border rounded-2xl p-4 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:border-primary/50 transition-all duration-200 cursor-pointer h-16">
            <div className="bg-primary/10 p-1 rounded-full">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            Yeni Proje Ekle
          </div>
        </Link>
      </div>
    </div>
  );
}
