"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Check, Crown } from "lucide-react";
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
import { useRouter } from "next/navigation"; // 👈 EKLENDİ
import { Spinner } from "@/components/ui/spinner";

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
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter(); // 👈 EKLENDİ

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
      // Backend'deki "Scenario 2" Transaction'ı tetiklenir
      const res = await fetch(`/api/project/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({ ownerId: selectedUser.id }),
      });

      if (!res.ok) throw new Error("Devredilemedi");

      toast.success(`Sahiplik devredildi. Artık yöneticisiniz.`);

      // Cache'i güncelle
      await mutate(`/api/project/${projectId}`);

      // 👈 ÖNEMLİ: Server Component'leri (Sidebar, Header vb.) yenile
      router.refresh();

      setOpen(false);
    } catch (error) {
      toast.error("Hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* Trigger yoksa varsayılan bir buton göster, varsa trigger'ı kullan */}
        <div className="cursor-pointer w-full">
          {trigger || <Button variant="outline">Sahibi Değiştir</Button>}
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-[350px] p-0" align="start">
        {/* ... (Tasarım kodların aynı kalacak) ... */}

        <div className="p-4 border-b bg-slate-50 dark:bg-slate-900/50">
          <h4 className="font-semibold text-sm">Proje Sahibini Değiştir</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Dikkat: Bu işlem geri alınamaz. Projenin tam yetkisi seçilen kişiye
            geçer.
          </p>
        </div>

        {/* ... (Arama inputu ve liste kodların aynı) ... */}
        <div className="p-2 flex flex-col gap-2">
          {/* ... ARAMA INPUTU AYNI ... */}
          <div className="relative px-2 py-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Üye ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="max-h-[240px] overflow-y-auto custom-scrollbar px-2 mt-1">
            {/* ... LİSTELEME AYNI ... */}
            {isLoading && (
              <div className="text-center py-4 text-xs">Yükleniyor...</div>
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
                        ? "opacity-100 cursor-default bg-yellow-50"
                        : "cursor-pointer hover:bg-slate-100"
                    }
                    ${isSelected ? "bg-blue-50 ring-1 ring-blue-200" : ""}
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
                      {/* ROZETLER AYNI */}
                      {isCurrentOwner ? (
                        <span className="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-bold flex items-center gap-1 border border-yellow-200">
                          <Crown className="h-3 w-3" /> Lider
                        </span>
                      ) : isAdmin ? (
                        <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold border border-blue-200">
                          Yönetici
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium border border-slate-200">
                          Üye
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-3 border-t flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/50">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            İptal
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!selectedUser || isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? <Spinner className="size-8" /> : "Devret"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
