"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon, Users, Loader2, Check, X } from "lucide-react"; // X ikonunu ekledik
import { DataTable } from "./project-data/data-table";
import { columns } from "./project-data/columns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { User } from "@/types/user";

export const ProjectList = ({ projects }: { projects: any[] }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // --- ARAMA VE SEÇİM STATE'LERİ ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  // --- DEBOUNCE ARAMA MANTIĞI ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 0) {
        setIsSearching(true);
        try {
          // API isteği: Özel karakterler için encodeURIComponent kullanıyoruz
          const res = await fetch(
            `/api/user?q=${encodeURIComponent(searchQuery)}`
          );
          const data = await res.json();
          setSearchResults(data);
          console.log("Arama sonuçları:", data);
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

  const toggleUser = (user: User) => {
    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      // 3. YOKSA EKLE (Add):
      // Mevcut listenin kopyasını al (...selectedUsers) ve sonuna yeni kullanıcıyı (user) ekle.
      setSelectedUsers([...selectedUsers, user]);
    }
  };

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

        {/* Arama Çubuğu ve Kullanıcı Ekleme Butonu */}
        <div className="w-fit flex flex-row justify-center items-center gap-2">
          {/* Genel Proje Arama Inputu (Local) */}
          <InputGroup>
            <InputGroupInput placeholder="Search..." />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>

          {/* KULLANICI EKLEME POPOVER'I */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="ml-2">
                <Users className="h-4 w-4" />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              className="w-[400px] p-0 overflow-hidden border shadow-xl"
              align="start"
            >
              {/* 1. ÜST GÖRSEL ALANI (Seçilen Kullanıcılar) - YENİ TASARIM */}
              <div className="min-h-[150px] bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center border-b py-6 transition-all">
                {selectedUsers.length > 0 ? (
                  <div className="w-full px-4">
                    {/* Seçilenler Listesi - Grid/Wrap Yapısı */}
                    <div className="flex flex-wrap justify-center gap-4 max-h-[200px] overflow-y-auto p-2 custom-scrollbar">
                      {selectedUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex flex-col items-center group animate-in zoom-in-50 duration-300"
                        >
                          <div className="relative">
                            <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                              <AvatarImage
                                src={user.image || ""}
                                className="object-cover"
                              />
                              <AvatarFallback className="text-xs font-bold text-slate-600">
                                {getInitials(user.name, "")}
                              </AvatarFallback>
                            </Avatar>

                            {/* Hızlı Kaldırma Butonu (Hover olunca görünür) */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleUser(user); // Listeden çıkarır
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-[2px] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity scale-90 hover:scale-100"
                              title="Kaldır"
                            >
                              <X className="h-3 w-3 cursor-pointer" />
                            </button>
                          </div>

                          {/* İsim (Sadece ilk kelime) */}
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mt-1 max-w-[64px] truncate text-center">
                            {user.name?.split(" ")[0]}
                          </span>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-center text-muted-foreground mt-3 border-t pt-2 w-full">
                      Toplam {selectedUsers.length} kişi eklenecek
                    </p>
                  </div>
                ) : (
                  /* Boş Durum (Seçim Yoksa) */
                  <div className="flex flex-col items-center gap-3 opacity-60">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm border border-dashed border-slate-300">
                      <Users className="h-6 w-6 text-slate-400" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Henüz kimse seçilmedi
                    </span>
                  </div>
                )}
              </div>
              {/* 2. İÇERİK ALANI (Arama) */}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-1">
                  Katkıda bulunanları ekle
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Projeye dahil etmek istediğiniz kişileri arayın ve seçin.
                </p>

                {/* --- CANLI ARAMA ALANI --- */}
                <div className="flex flex-col gap-2">
                  <InputGroup>
                    <InputGroupAddon>
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Users className="h-4 w-4 text-muted-foreground" />
                      )}
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="İsim veya e-posta ile arayın..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                  {searchResults.length > 0 && (
                    <div className="w-full bg-white dark:bg-gray-950 border rounded-md shadow-sm max-h-60 overflow-y-auto mt-1 animate-in fade-in-0 slide-in-from-top-2">
                      <p className="text-xs font-medium text-muted-foreground px-3 py-2 bg-slate-50 dark:bg-slate-900 border-b sticky top-0">
                        Arama Sonuçları
                      </p>
                      {searchResults.map((user) => {
                        const isSelected = selectedUsers.some(
                          (u) => u.id === user.id
                        );
                        return (
                          <div
                            key={user.id}
                            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b last:border-0 ${
                              isSelected
                                ? "bg-blue-50 dark:bg-blue-900/20"
                                : "hover:bg-slate-50 dark:hover:bg-slate-900"
                            }`}
                            onClick={() => {
                              toggleUser(user);
                              setSearchQuery("");
                              setSearchResults([]);
                            }}
                          >
                            <Avatar className="h-9 w-9 border border-slate-200">
                              <AvatarImage src={user.image || ""} />
                              <AvatarFallback className="text-xs">
                                {getInitials(user.name, "")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <p className="text-sm font-medium truncate">
                                  {user.name}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                            <div>
                              {isSelected && (
                                <Check className="h-4  w-4 text-blue-600 ml-2" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Sonuç bulunamazsa mesajı */}
                  {searchQuery.length > 1 &&
                    !isSearching &&
                    searchResults.length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-4 bg-slate-50 dark:bg-slate-900 rounded-md border border-dashed">
                        Kullanıcı bulunamadı.
                      </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-2">
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    İptal
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={selectedUsers.length === 0}
                    onClick={() => {
                      console.log(
                        "DB'ye eklenecek ID'ler:",
                        selectedUsers.map((u) => u.id)
                      );
                      // TODO: API Çağrısı
                      setOpen(false);
                      setSearchQuery("");
                      setSelectedUsers([]);
                    }}
                  >
                    Ekle ({selectedUsers.length})
                  </Button>
                </div>
              </div>{" "}
            </PopoverContent>
          </Popover>
        </div>
      </nav>

      {/* Proje Tablosu */}
      <section className="">
        <div className="">
          <DataTable columns={columns} data={projects} />
        </div>
      </section>
    </main>
  );
};
