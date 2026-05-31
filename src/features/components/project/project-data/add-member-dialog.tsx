"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { useTranslations } from "next-intl";

interface AddMemberDialogProps {
  projectId: string;
  projectName: string;
  trigger?: React.ReactNode;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// ============================================================================
// UTILITY FUNCTIONS - Bileşen dışında tutarak test edilebilirliği arttır
// ============================================================================

/**
 * Arama sorgusuna göre kullanıcıları filtreler
 */
const filterUsers = (
  users: User[],
  query: string,
  excludeIds: Set<string>
): User[] => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  return users.filter(
    (user) =>
      !excludeIds.has(user.id) &&
      (user?.name?.toLowerCase().includes(lowerQuery) ||
        user?.email?.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Rol badgesi oluşturur
 */
interface UserBadgeProps {
  role?: string;
  isOwner: boolean;
  t: any;
}

const UserBadge = ({ role, isOwner, t }: UserBadgeProps) => {
  if (isOwner) {
    return (
      <span className="ml-2 flex items-center gap-1 rounded-full border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-700 dark:border-yellow-900/30 dark:bg-yellow-900/30 dark:text-yellow-500">
        <Crown className="h-3 w-3" />
        {t("roles.owner")}
      </span>
    );
  }

  if (role === "ADMIN") {
    return (
      <span className="ml-2 rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/30 dark:text-blue-400">
        {t("roles.admin")}
      </span>
    );
  }

  if (role === "MEMBER") {
    return (
      <span className="ml-2 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
        {t("roles.member")}
      </span>
    );
  }

  return null;
};

/**
 * Boş durum gösterir
 */
interface EmptyStateProps {
  hasSearch: boolean;
  t: any;
}

const EmptyState = ({ hasSearch, t }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground opacity-60 border-2 border-dashed rounded-lg mx-2">
    <Users className="h-8 w-8 mb-2 stroke-1" />
    <span className="text-xs">
      {hasSearch ? t("search.noResults") : t("search.noMembers")}
    </span>
  </div>
);

/**
 * Seçilen kullanıcıların chip'lerini gösterir
 */
interface SelectedChipsProps {
  users: User[];
  onRemove: (user: User) => void;
}

const SelectedChips = ({ users, onRemove }: SelectedChipsProps) => {
  if (users.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto custom-scrollbar pt-2">
      {users.map((user) => (
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
              onRemove(user);
            }}
            className="ml-1 hover:bg-red-100 hover:text-red-600 rounded-full p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

/**
 * Kullanıcı listesi öğesi
 */
interface UserListItemProps {
  user: User;
  isAlreadyMember: boolean;
  isSelected: boolean;
  isOwner: boolean;
  role?: string;
  onToggle: (user: User) => void;
  t: any;
}

const UserListItem = ({
  user,
  isAlreadyMember,
  isSelected,
  isOwner,
  role,
  onToggle,
  t,
}: UserListItemProps) => (
  <div
    onClick={() => onToggle(user)}
    className={`flex items-center gap-3 p-2 rounded-md transition-all text-sm mb-1
      ${
        isAlreadyMember
          ? "opacity-100 cursor-default"
          : "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
      }
      ${
        isSelected
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
        <UserBadge role={role} isOwner={isOwner} t={t} />
      </div>
      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
    </div>

    {(isAlreadyMember || isSelected) && (
      <div className={isAlreadyMember ? "text-slate-400" : "text-blue-600"}>
        <Check className="h-4 w-4" />
      </div>
    )}
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AddMemberDialog({
  projectId,
  projectName,
  trigger,
}: AddMemberDialogProps) {
  const t = useTranslations("AddMemberDialog");
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();
  const { addMember, isLoading } = useAddMember();

  // ---- STATE ----
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ---- DATA FETCHING ----
  const {
    data: projectData,
    isLoading: isProjectLoading,
    mutate: localMutate,
  } = useSWR<ProjectData>(open ? `/api/project/${projectId}` : null, fetcher);

  // ---- DERIVED STATE ----
  const activeOwnerId = projectData?.ownerId ?? "";

  const existingMemberIds = useMemo(
    () => new Set<string>(projectData?.members?.map((m) => m.user.id) || []),
    [projectData?.members]
  );

  const existingMembersList = useMemo(
    () =>
      projectData?.members?.map((m) => ({
        ...m.user,
        role: m.role,
      })) || [],
    [projectData?.members]
  );

  // ---- SEARCH LOGIC ----
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length === 0) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/user?q=${encodeURIComponent(searchQuery)}`
        );

        if (!res.ok) {
          throw new Error("Arama başarısız");
        }

        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Arama hatası:", err);
        setError(t("search.error"));
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, t]);

  // ---- TOGGLE USER ----
  const toggleUser = useCallback(
    (user: User) => {
      // Zaten üye ise seçme izni verme
      if (existingMemberIds.has(user.id)) {
        return;
      }

      setSelectedUsers((prev) =>
        prev.find((u) => u.id === user.id)
          ? prev.filter((u) => u.id !== user.id)
          : [...prev, user]
      );
    },
    [existingMemberIds]
  );

  // ---- ADD MEMBERS ----
  const handleAddMembers = useCallback(async () => {
    if (selectedUsers.length === 0) return;

    const newMembers = selectedUsers.map((u) => ({
      user: u,
      role: "MEMBER" as const,
    }));

    const optimisticData: ProjectData = {
      ownerId: projectData?.ownerId || "",
      members: [...(projectData?.members || []), ...newMembers],
    };

    // Optimistic update
    await localMutate(optimisticData, false);

    // Reset form
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUsers([]);
    setError(null);

    try {
      // API isteği yap
      await addMember({
        projectId,
        userIds: selectedUsers.map((u) => u.id),
      });

      // Cache'i güncelle
      await globalMutate(`/api/project/${projectId}`);
      await globalMutate("/api/project");
      router.refresh();

      // Dialog kapat
      setOpen(false);
    } catch (err) {
      console.error("Üye ekleme hatası:", err);
      setError(t("error.addFailed"));

      // Optimistic update'i geri al
      await localMutate();
      await globalMutate(`/api/project/${projectId}`);
    }
  }, [selectedUsers, projectData, projectId, localMutate, addMember, globalMutate, router, t]);

  // ---- DISPLAY LOGIC ----
  const displayList = useMemo(
    () =>
      searchQuery.length > 0
        ? filterUsers(searchResults, searchQuery, existingMemberIds)
        : existingMembersList,
    [searchQuery, searchResults, existingMemberIds, existingMembersList]
  );

  const listTitle = useMemo(
    () =>
      searchQuery.length > 0
        ? t("search.titles.searchResults")
        : t("search.titles.existingMembers"),
    [searchQuery, t]
  );

  // ---- RESET DIALOG STATE ----
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);

      if (!isOpen) {
        setTimeout(() => {
          setSearchQuery("");
          setSearchResults([]);
          setSelectedUsers([]);
          setError(null);
        }, 200);
      }
    },
    []
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {trigger ? (
          <div className="w-full cursor-pointer">{trigger}</div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            title={t("trigger.title", { projectName })}
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
        {/* ---- HEADER ---- */}
        <div className="bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm border-b p-4 flex flex-col gap-3">
          <div>
            <h4 className="font-semibold text-sm leading-none">
              {t("header.title")}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {t.rich("header.projectLabel", {
                projectName: projectName,
                span: (chunks) => (
                  <span className="font-medium text-foreground">{chunks}</span>
                ),
              })}
            </p>
          </div>

          <SelectedChips users={selectedUsers} onRemove={toggleUser} />
        </div>

        {/* ---- SEARCH INPUT ---- */}
        <div className="p-2">
          <div className="relative px-2 py-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-muted/30 border-muted-foreground/20 focus-visible:ring-1"
              disabled={isProjectLoading && !searchQuery}
            />
            {isSearching && (
              <Spinner className="absolute right-5 top-1/2 -translate-y-1/2 h-3 w-3" />
            )}
          </div>

          {/* ---- ERROR MESSAGE ---- */}
          {error && (
            <div className="mx-2 mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* ---- USER LIST ---- */}
          <div className="h-[240px] overflow-y-auto custom-scrollbar px-2 flex flex-col gap-2">
            <div className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-2 sticky top-0 bg-white dark:bg-black z-10">
              {listTitle}
            </div>

            <div className="space-y-1">
              {/* Loading state */}
              {isProjectLoading && !searchQuery && (
                <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                  {t("search.loading")}
                </div>
              )}

              {/* Empty state */}
              {displayList.length === 0 &&
                !isSearching &&
                !isProjectLoading &&
                !error && <EmptyState hasSearch={searchQuery.length > 0} t={t} />}

              {/* User items */}
              {displayList.map((user) => {
                const isAlreadyMember = existingMemberIds.has(user.id);
                const isSelected = selectedUsers.some((u) => u.id === user.id);

                const memberRecord = existingMembersList.find(
                  (m) => m.id === user.id
                );
                const userRole = (user as UserWithRole).role || memberRecord?.role;
                const isOwner = user.id === activeOwnerId;

                return (
                  <UserListItem
                    key={user.id}
                    user={user}
                    isAlreadyMember={isAlreadyMember}
                    isSelected={isSelected}
                    isOwner={isOwner}
                    role={userRole}
                    onToggle={toggleUser}
                    t={t}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* ---- FOOTER ---- */}
        <div className="bg-slate-50 dark:bg-slate-900 border-t p-3 flex justify-between items-center">
          <div className="text-xs text-muted-foreground px-1">
            {selectedUsers.length > 0 ? (
              <span className="text-blue-600 font-medium">
                {t("footer.selectedCount", { count: selectedUsers.length })}
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
              {t("footer.close")}
            </Button>
            <Button
              size="sm"
              className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddMembers}
              disabled={selectedUsers.length === 0 || isLoading}
            >
              {isLoading && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
              {t("footer.add")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}