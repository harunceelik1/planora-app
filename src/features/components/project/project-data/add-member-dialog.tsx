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
import useSWR, { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";
import { ProjectData, UserWithRole } from "@/types/project";
import { Spinner } from "@/components/ui/spinner";
// 👇 1. IMPORT ET
import { useTranslations } from "next-intl";

interface AddMemberDialogProps {
  projectId: string;
  projectName: string;
  trigger?: React.ReactNode;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AddMemberDialog({
  projectId,
  projectName,
  trigger,
}: AddMemberDialogProps) {
  // 👇 2. HOOK'U BAŞLAT
  const t = useTranslations("AddMemberDialog");

  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();

  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const { addMember, isLoading } = useAddMember();

  // Dialog verisi
  const {
    data: projectData,
    isLoading: isProjectLoading,
    mutate: localMutate,
  } = useSWR<ProjectData>(open ? `/api/project/${projectId}` : null, fetcher);

  const activeOwnerId = projectData?.ownerId;

  const existingMemberIds = new Set<string>(
    projectData?.members?.map((m) => m.user.id) || []
  );

  const existingMembersList: UserWithRole[] =
    projectData?.members?.map((m) => ({
      ...m.user,
      role: m.role,
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

  const toggleUser = (user: User) => {
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

    // Optimistic Update
    const newMembers = selectedUsers.map((u) => ({
      user: u,
      role: "MEMBER",
    }));

    const optimisticData: ProjectData = {
      ownerId: projectData?.ownerId || "",
      members: [...(projectData?.members || []), ...newMembers],
    };

    await localMutate(optimisticData, false);

    setSearchQuery("");
    setSearchResults([]);
    setSelectedUsers([]);

    try {
      await addMember({
        projectId,
        userIds: newMembers.map((m) => m.user.id),
      });

      await globalMutate(`/api/project/${projectId}`);
      await globalMutate("/api/project");
      router.refresh();
    } catch (error) {
      console.error("Üye ekleme hatası:", error);
      await localMutate();
      await globalMutate(`/api/project/${projectId}`);
    }
  };

  // Liste Kararı
  const displayList: (User | UserWithRole)[] =
    searchQuery.length > 0 ? searchResults : existingMembersList;

  // 👇 Çeviriyi burada kullanıyoruz
  const listTitle =
    searchQuery.length > 0
      ? t("search.titles.searchResults")
      : t("search.titles.existingMembers");

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
          <div className="w-full cursor-pointer">{trigger}</div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            title={t("trigger.title", { projectName })} // Çeviri
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent
        className="w-[90vw] sm:w-[420px] p-0 overflow-hidden border shadow-2xl rounded-xl"
        align="start"
        side="bottom"
        sideOffset={8}
      >
        {/* HEADER */}
        <div className="bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm border-b p-4 flex flex-col gap-3">
          <div>
            <h4 className="font-semibold text-sm leading-none">
              {t("header.title")}
            </h4>{" "}
            {/* Çeviri */}
            <p className="text-xs text-muted-foreground mt-1">
              {/* Rich text çeviri: proje ismini bold yapmak için */}
              {t.rich("header.projectLabel", {
                projectName: projectName,
                span: (chunks) => (
                  <span className="font-medium text-foreground">{chunks}</span>
                ),
              })}
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

        {/* LİSTE */}
        <div className="p-2">
          <div className="relative px-2 py-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search.placeholder")} // Çeviri
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-muted/30 border-muted-foreground/20 focus-visible:ring-1"
            />
            {isSearching && (
              <Spinner
                className="
            absolute right-5 top-1/2 -translate-y-1/2 h-3 w-3  
            "
              />
            )}
          </div>

          <div className="h-[240px] overflow-y-auto custom-scrollbar px-2 flex flex-col gap-2">
            <div className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-2 sticky top-0 bg-white dark:bg-black z-10 flex items-center justify-between">
              {listTitle}
            </div>

            <div className="space-y-1">
              {isProjectLoading && !searchQuery && (
                <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                  {t("search.loading")} {/* Çeviri */}
                </div>
              )}

              {displayList.length === 0 &&
                !isSearching &&
                !isProjectLoading && (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground opacity-60 border-2 border-dashed rounded-lg mx-2">
                    <Users className="h-8 w-8 mb-2 stroke-1" />
                    <span className="text-xs">
                      {searchQuery
                        ? t("search.noResults")
                        : t("search.noMembers")}{" "}
                      {/* Çeviri */}
                    </span>
                  </div>
                )}

              {displayList.map((user) => {
                const isAlreadyMember = existingMemberIds.has(user.id);
                const isSelectedNew = selectedUsers.some(
                  (u) => u.id === user.id
                );
                const showCheck = isAlreadyMember || isSelectedNew;

                let userRole = (user as UserWithRole).role;

                if (!userRole && isAlreadyMember) {
                  const memberRecord = existingMembersList.find(
                    (m) => m.id === user.id
                  );
                  userRole = memberRecord?.role || "";
                }

                const isOwner = user.id === activeOwnerId;
                const isAdmin = userRole === "ADMIN";

                // ROZET (Çeviri ile)
                let badge = null;
                if (isOwner) {
                  badge = (
                    <span className="ml-2 flex items-center gap-1 rounded-full border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-700 dark:border-yellow-900/30 dark:bg-yellow-900/30 dark:text-yellow-500">
                      <Crown className="h-3 w-3" /> {t("roles.owner")}{" "}
                      {/* Çeviri */}
                    </span>
                  );
                } else if (isAdmin) {
                  badge = (
                    <span className="ml-2 rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/30 dark:text-blue-400">
                      {t("roles.admin")} {/* Çeviri */}
                    </span>
                  );
                } else if (isAlreadyMember) {
                  badge = (
                    <span className="ml-2 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
                      {t("roles.member")} {/* Çeviri */}
                    </span>
                  );
                }

                return (
                  <div
                    key={user.id}
                    onClick={() => toggleUser(user)}
                    className={`flex items-center gap-3 p-2 rounded-md transition-all text-sm mb-1
                      ${
                        isAlreadyMember
                          ? "opacity-100 cursor-default"
                          : "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                      }
                      ${
                        isSelectedNew
                          ? "bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-200 dark:ring-blue-800"
                          : ""
                      }
                    `}
                  >
                    <Avatar className="h-8 w-8 border border-slate-200">
                      <AvatarImage src={user.image || ""} />
                      <AvatarFallback className="text-xs bg-slate-100 text-slate-600">
                        {getInitials(user.name, "")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap">
                        <span className="font-medium truncate text-foreground">
                          {user.name}
                        </span>
                        {badge}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>

                    {showCheck && (
                      <div
                        className={
                          isAlreadyMember ? "text-slate-400" : "text-blue-600"
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

        <div className="bg-slate-50 dark:bg-slate-900 border-t p-3 flex justify-between items-center">
          <div className="text-xs text-muted-foreground px-1">
            {selectedUsers.length > 0 ? (
              <span className="text-blue-600 font-medium">
                {t("footer.selectedCount", { count: selectedUsers.length })}{" "}
                {/* Çeviri */}
              </span>
            ) : (
              <span>
                {t("footer.memberCount", { count: existingMembersList.length })}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setOpen(false)}
            >
              {t("footer.close")} {/* Çeviri */}
            </Button>
            <Button
              size="sm"
              className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddMembers}
              disabled={selectedUsers.length === 0 || isLoading}
            >
              {isLoading && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
              {t("footer.add")} {/* Çeviri */}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
