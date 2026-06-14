"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Crown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { User } from "@/types/user";
import useSWR, { mutate } from "swr";
import { toast } from "react-toastify";
import { ProjectData, UserWithRole } from "@/types/project";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
// 👇 1. IMPORT ET
import { useTranslations } from "next-intl";

interface ChangeOwnerDialogProps {
  projectId: string;
  currentOwnerId: string;
  trigger?: React.ReactNode;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ChangeOwnerDialog({
  projectId,
  trigger,
}: ChangeOwnerDialogProps) {
  // 👇 2. HOOK'U BAŞLAT
  const t = useTranslations("ChangeOwnerDialog");

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // 1. GÜNCEL PROJE VERİSİNİ ÇEK
  const { data: projectData, isLoading } = useSWR<ProjectData>(
    open ? `/api/project/${projectId}` : null,
    fetcher
  );

  const activeOwnerId = projectData?.ownerId;

  // 2. LİSTEYİ ROL BİLGİSİYLE BİRLİKTE HAZIRLA
  const memberList: UserWithRole[] =
    projectData?.members?.map((m) => ({
      ...m.user,
      role: m.role,
    })) || [];

  const filteredMembers = memberList.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/project/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({ ownerId: selectedUser.id }),
      });

      if (!res.ok) throw new Error("Devredilemedi");

      toast.success(t("toasts.success")); // Çeviri: Sahiplik devredildi...

      await mutate(`/api/project/${projectId}`);
      router.refresh();

      setOpen(false);
    } catch (error) {
      toast.error(t("toasts.error")); // Çeviri: Hata oluştu
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="cursor-pointer w-full">
          {trigger || <Button variant="outline">{t("trigger")}</Button>}{" "}
          {/* Çeviri: Sahibi Değiştir */}
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-[350px] p-0" align="start">
        <div className="p-4 border-b bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{t("header.title")}</h4>{" "}
          {/* Çeviri: Proje Sahibini Değiştir */}
          <p className="text-xs text-muted-foreground mt-1">
            {t("header.warning")} {/* Çeviri: Dikkat... */}
          </p>
        </div>

        <div className="p-2 flex flex-col gap-2">
          <div className="relative px-2 py-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search.placeholder")} // Çeviri: Üye ara...
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="max-h-[240px] overflow-y-auto custom-scrollbar px-2 mt-1">
            {isLoading && (
              <div className="text-center py-4 text-xs">
                {t("search.loading")}
              </div> // Çeviri: Yükleniyor...
            )}

            {filteredMembers.map((user) => {
              const isCurrentOwner = user.id === activeOwnerId;
              const isSelected = selectedUser?.id === user.id;
              const isAdmin = user.role === "ADMIN";

              return (
                <div
                  key={user.id}
                  onClick={() => !isCurrentOwner && setSelectedUser(user)}
                  className={`
                    flex items-center gap-3 p-2 rounded-md transition-all text-sm mb-1 mt-2
                    ${
                      isCurrentOwner
                        ? "opacity-100 cursor-default bg-yellow-50 dark:bg-yellow-900/20"
                        : "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                    }
                    ${isSelected ? "bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-200 dark:ring-blue-800" : ""}
                  `}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(user.name, "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{user.name}</span>

                      {/* ROZETLER (Çeviri ile) */}
                      {isCurrentOwner ? (
                        <span className="text-[10px] px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 rounded-full font-bold flex items-center gap-1 border border-yellow-200 dark:border-yellow-900/30">
                          <Crown className="h-3 w-3" /> {t("roles.owner")}{" "}
                          {/* Çeviri: Lider */}
                        </span>
                      ) : isAdmin ? (
                        <span className="text-[10px] px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-bold border border-blue-200 dark:border-blue-900/30">
                          {t("roles.admin")} {/* Çeviri: Yönetici */}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-medium border border-slate-200 dark:border-slate-800">
                          {t("roles.member")} {/* Çeviri: Üye */}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/50">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            {t("buttons.cancel")} {/* Çeviri: İptal */}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!selectedUser || isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? <Spinner className="size-8" /> : t("buttons.transfer")}{" "}
            {/* Çeviri: Devret */}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
