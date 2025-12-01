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

interface ChangeOwnerDialogProps {
  projectId: string;
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

  // 1. GÜNCEL PROJE VERİSİNİ ÇEK
  const { data: projectData, isLoading } = useSWR(
    open ? `/api/project/${projectId}` : null,
    fetcher
  );

  const activeOwnerId = projectData?.ownerId;

  // 2. LİSTEYİ ROL BİLGİSİYLE BİRLİKTE HAZIRLA
  const memberList =
    projectData?.members?.map((m: any) => ({
      ...m.user,
      role: m.role, // 👇 Rolü saklıyoruz
    })) || [];

  const filteredMembers = memberList.filter(
    (user: any) =>
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

      toast.success(`Sahiplik devredildi.`);
      await mutate(`/api/project/${projectId}`);
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
        <div className="cursor-pointer w-full">{trigger}</div>
      </PopoverTrigger>

      <PopoverContent className="w-[350px] p-0" align="start">
        <div className="p-4 border-b bg-slate-50 dark:bg-slate-900/50">
          <h4 className="font-semibold text-sm">Proje Sahibini Değiştir</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Yeni bir sahip seçin.
          </p>
        </div>

        <div className="p-2 flex flex-col gap-2">
          <div className="relative px-2 py-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Üye ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="max-h-[240px]  overflow-y-auto custom-scrollbar px-2 mt-1">
            {isLoading && (
              <div className="text-center py-4 text-xs">Yükleniyor...</div>
            )}

            {filteredMembers.map((user: any) => {
              // 👇 SAHİPLİK VE SEÇİM KONTROLÜ
              const isCurrentOwner = user.id === activeOwnerId;
              const isSelected = selectedUser?.id === user.id;
              const isAdmin = user.role === "ADMIN"; // Yönetici mi?

              return (
                <div
                  key={user.id}
                  // Sahip zaten seçili olduğu için tıklanamaz yapıyoruz
                  onClick={() => !isCurrentOwner && setSelectedUser(user)}
                  className={`
                    flex items-center gap-3 p-2 rounded-md transition-all text-sm mb-1 mt-2
                    ${
                      isCurrentOwner
                        ? "opacity-100 cursor-default bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20"
                        : "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                    }
                    ${
                      isSelected
                        ? "bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-900/20"
                        : ""
                    }
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

                      {/* 👇 ROZETLER (BADGES) */}
                      {isCurrentOwner ? (
                        // SAHİP
                        <span className="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500 rounded-full font-bold flex items-center gap-1 border border-yellow-200">
                          <Crown className="h-3 w-3" /> Lider
                        </span>
                      ) : isAdmin ? (
                        // YÖNETİCİ
                        <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full font-bold border border-blue-200">
                          Yönetici
                        </span>
                      ) : (
                        // ÜYE
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 rounded-full font-medium border border-slate-200">
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
            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Devret"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
