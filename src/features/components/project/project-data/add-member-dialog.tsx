"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Loader2,
  Check,
  UserPlus,
  X,
  Search,
  UserCheck,
  Crown,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { User } from "@/types/user";
import { useAddMember } from "@/hooks/useAddMember";
import useSWR from "swr";

interface AddMemberDialogProps {
  projectId: string;
  projectName: string;
  trigger?: React.ReactNode; // Trigger prop'u ekledik (Ayarlar sayfası için)
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AddMemberDialog({
  projectId,
  projectName,
  trigger,
}: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);

  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const { addMember, isLoading } = useAddMember();

  // 1. VERİYİ DOĞRU URL İLE ÇEKİYORUZ (/api/project/[id])
  const {
    data: projectData,
    isLoading: isProjectLoading,
    mutate,
  } = useSWR(open ? `/api/project/${projectId}` : null, fetcher);
  console.log("API'den Gelen Üyeler:", projectData?.members);
  // 2. GÜNCEL SAHİP ID
  const activeOwnerId = projectData?.ownerId;

  // 3. MEVCUT ÜYE ID'LERİ (Set)
  const existingMemberIds = new Set<string>(
    projectData?.members?.map((m: any) => m.userId) || []
  );

  // 4. MEVCUT ÜYE LİSTESİ (User objelerini alıyoruz)
  const existingMembersList =
    projectData?.members?.map((m: any) => ({
      ...m.user, // User bilgileri (id, name, image)
      role: m.role, // Rol bilgisi (OWNER, ADMIN, MEMBER)
    })) || [];

  // --- ARAMA MANTIĞI ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 0) {
        setIsSearching(true);
        try {
          const res = await fetch(
            `/api/user?q=${encodeURIComponent(searchQuery)}`
          );
          const data = await res.json();
          setSearchResults(data);
        } catch (error) {
          console.error("Arama hatası", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // --- SEÇİM MANTIĞI ---
  const toggleUser = (user: User) => {
    // Zaten üyeyse seçtirme (Lider veya Member fark etmez)
    if (existingMemberIds.has(user.id)) return;

    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // --- EKLEME İŞLEMİ ---
  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;

    // Optimistic Update için hazırlık
    const newMembers = selectedUsers.map((u) => ({
      userId: u.id,
      user: u,
    }));

    const optimisticData = {
      ...projectData,
      members: [...(projectData?.members || []), ...newMembers],
    };

    // Cache'i hemen güncelle
    await mutate(optimisticData, false);

    setSearchQuery("");
    setSearchResults([]);
    setSelectedUsers([]);

    try {
      await addMember({
        projectId,
        userIds: newMembers.map((m) => m.userId),
      });
      // İşlem bitince sunucudan tekrar doğrula
      await mutate();
    } catch (error) {
      console.error("Üye ekleme hatası:", error);
      await mutate(); // Hata varsa geri al
    }
  };

  // Liste Kararı
  const displayList =
    searchQuery.length > 0 ? searchResults : existingMembersList;
  const listTitle =
    searchQuery.length > 0 ? "Arama Sonuçları" : "Mevcut Üyeler";

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setTimeout(() => {
            setSearchQuery("");
            setSearchResults([]);
            setSelectedUsers([]);
          }, 200);
        }
      }}
    >
      <PopoverTrigger asChild>
        {trigger ? (
          // Eğer dışarıdan trigger geldiyse onu kullan (Ayarlar sayfası için)
          <div className="w-full cursor-pointer">{trigger}</div>
        ) : (
          // Yoksa varsayılan buton
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            title={`Üye Ekle: ${projectName}`}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent
        className="w-[90vw] sm:w-[420px] p-0 overflow-hidden border shadow-2xl rounded-xl"
        align="end"
        sideOffset={8}
      >
        {/* 1. HEADER */}
        <div className="bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm border-b p-4 flex flex-col gap-3">
          <div>
            <h4 className="font-semibold text-sm leading-none">Kişi Ekle</h4>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium text-foreground">{projectName}</span>{" "}
              projesi
            </p>
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto custom-scrollbar pt-2">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-1 pl-1 pr-2 py-1 bg-white dark:bg-slate-800 border rounded-full shadow-sm animate-in zoom-in-50 duration-200"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback className="text-[9px]">
                      {getInitials(user.name, "")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium max-w-[80px] truncate">
                    {user.name?.split(" ")[0]}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleUser(user);
                    }}
                    className="ml-1 hover:bg-red-100 hover:text-red-600 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. LİSTE */}
        <div className="p-2">
          <div className="relative px-2 py-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="İsim veya e-posta ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-muted/30 border-muted-foreground/20 focus-visible:ring-1"
            />
            {isSearching && (
              <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="h-[240px] overflow-y-auto custom-scrollbar px-2 flex flex-col gap-2">
            <div className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-2 sticky top-0 bg-white dark:bg-black z-10 flex items-center justify-between">
              {listTitle}
            </div>

            <div className="space-y-1">
              {isProjectLoading && !searchQuery && (
                <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                  Yükleniyor...
                </div>
              )}

              {displayList.length === 0 &&
                !isSearching &&
                !isProjectLoading && (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground opacity-60 border-2 border-dashed rounded-lg mx-2">
                    <Users className="h-8 w-8 mb-2 stroke-1" />
                    <span className="text-xs">
                      {searchQuery ? "Sonuç bulunamadı" : "Henüz üye yok"}
                    </span>
                  </div>
                )}
              {displayList.map((user: any) => {
                // user: any yaptık çünkü içinde 'role' olabilir
                const isAlreadyMember = existingMemberIds.has(user.id);
                const isSelectedNew = selectedUsers.some(
                  (u) => u.id === user.id
                );
                const showCheck = isAlreadyMember || isSelectedNew;

                // 1. KULLANICININ ROLÜNÜ BUL
                // Eğer listede zaten varsa, rolünü 'existingMembersList' içinden bulmalıyız.
                // (Çünkü arama sonuçlarında 'role' verisi gelmez)
                let userRole = user.role;

                if (!userRole && isAlreadyMember) {
                  const memberRecord = existingMembersList.find(
                    (m: any) => m.id === user.id
                  );
                  userRole = memberRecord?.role;
                }

                // 2. KİM BU KİŞİ? (Sahip mi, Yönetici mi?)
                const isOwner = user.id === activeOwnerId;
                const isAdmin = userRole === "ADMIN";

                return (
                  <div
                    key={user.id}
                    onClick={() => toggleUser(user)}
                    className={`flex items-center gap-3 p-2 rounded-md transition-all text-sm
                      ${
                        isAlreadyMember
                          ? "opacity-60 cursor-default"
                          : "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                      }
                      ${
                        isSelectedNew
                          ? "bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-200"
                          : ""
                      }
                    `}
                  >
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src={user.image || ""} />
                      <AvatarFallback className="text-xs bg-slate-100 text-slate-600">
                        {getInitials(user.name, "")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate text-foreground">
                          {user.name}
                        </span>

                        {isOwner ? (
                          <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold border border-amber-200">
                            <Crown className="h-3 w-3" /> Lider
                          </span>
                        ) : isAdmin ? (
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded font-bold border border-indigo-200">
                            Yönetici
                          </span>
                        ) : isAlreadyMember ? (
                          <span className="text-[10px] bg-slate-100 text-slate-500 dark:bg-slate-800 px-1.5 py-0.5 rounded font-medium border">
                            Üye
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>

                    {showCheck && (
                      <div
                        className={
                          isAlreadyMember
                            ? "text-muted-foreground"
                            : "text-blue-600"
                        }
                      >
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. FOOTER */}
        <div className="bg-slate-50 dark:bg-slate-900 border-t p-3 flex justify-between items-center">
          <div className="text-xs text-muted-foreground px-1">
            {selectedUsers.length > 0 ? (
              <span className="text-blue-600 font-medium">
                {selectedUsers.length} kişi seçildi
              </span>
            ) : (
              <span>{existingMembersList.length} üye</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setOpen(false)}
            >
              Kapat
            </Button>
            <Button
              size="sm"
              className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddMembers}
              disabled={selectedUsers.length === 0 || isLoading}
            >
              {isLoading && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
              Ekle
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
