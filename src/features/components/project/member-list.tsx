"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import {
  Shield,
  ShieldAlert,
  MoreVertical,
  ShieldCheck,
  Crown,
  Trash2,
  Loader2,
} from "lucide-react";
import { useMemberRole } from "@/hooks/useMemberRole";
import { useDeleteMember } from "@/hooks/useDeleteMember";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

interface Member {
  id: string; // ProjectMember ID
  role: "OWNER" | "ADMIN" | "MEMBER";
  user: {
    id: string; // User ID (Silme işlemi için gerekli)
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface MembersListProps {
  projectId: string;
  members: Member[];
  currentUserId: string;
  ownerId: string;
  onUpdate?: () => void;
}

export function MembersList({
  projectId,
  members,
  currentUserId,
  ownerId,
  onUpdate,
}: MembersListProps) {
  const t = useTranslations("ProjectList.memberManagement");

  // Hook'lar
  const { changeRole, isLoading: isRoleLoading } = useMemberRole();
  const { deleteMember, isLoading: isDeleting } = useDeleteMember();

  // STATE: Hangi üye silinmek üzere seçildi? (Null ise pencere kapalı)
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  const isCurrentUserOwner = currentUserId === ownerId;
  const isBusy = isRoleLoading || isDeleting;

  // Rol Değiştirme
  const handleRoleChange = async (userId: string, role: "ADMIN" | "MEMBER") => {
    const success = await changeRole({ projectId, userId, role });
    if (success && onUpdate) {
      onUpdate();
    }
  };

  // Silme Onayı Verildiğinde Çalışacak Fonksiyon
  const confirmDelete = async () => {
    if (memberToDelete) {
      // Hook'u tetikle
      await deleteMember(projectId, memberToDelete);

      // State'i temizle ve pencreyi kapat
      setMemberToDelete(null);

      // Listeyi güncelle (gerekirse)
      if (onUpdate) onUpdate();
    }
  };

  return (
    <>
      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-xl bg-card text-card-foreground shadow-sm hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors gap-3"
          >
            {/* SOL TARAF: KULLANICI BİLGİSİ */}
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-800">
                <AvatarImage src={member.user.image || ""} />
                <AvatarFallback className="text-xs font-medium">
                  {getInitials(member.user.name || "", "")}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium leading-none">
                    {member.user.name}
                  </p>

                  {/* ROZETLER */}
                  {member.role === "OWNER" && (
                    <Badge
                      variant="secondary"
                      className="text-[9px] px-1.5 h-4 gap-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
                    >
                      <Crown className="h-2.5 w-2.5" /> {t("leader")}
                    </Badge>
                  )}
                  {member.role === "ADMIN" && (
                    <Badge
                      variant="secondary"
                      className="text-[9px] px-1.5 h-4 gap-1 bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200"
                    >
                      <ShieldCheck className="h-2.5 w-2.5" /> {t("admin")}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {member.user.email}
                </p>
              </div>
            </div>

            {/* SAĞ TARAF: AKSİYON MENÜSÜ */}
            <div className="flex items-center justify-end">
              {/* Sadece Lider başkalarını yönetebilir ve kendini silemez */}
              {isCurrentUserOwner && member.id !== ownerId ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-800"
                      disabled={isBusy}
                    >
                      {isBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreVertical className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {/* Rol Değiştirme */}
                    {member.role === "MEMBER" ? (
                      <DropdownMenuItem
                        disabled={isBusy}
                        onClick={() => handleRoleChange(member.id, "ADMIN")}
                        className="cursor-pointer"
                      >
                        <Shield className="mr-2 h-4 w-4 text-blue-500" />
                        {t("makeAdmin")}
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        disabled={isBusy}
                        onClick={() => handleRoleChange(member.id, "MEMBER")}
                        className="cursor-pointer"
                      >
                        <ShieldAlert className="mr-2 h-4 w-4 text-orange-500" />
                        {t("removeAdmin")}
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    {/* Silme Seçeneği - Sadece State'i Günceller */}
                    <DropdownMenuItem
                      disabled={isBusy}
                      onClick={() => setMemberToDelete(member.user.id)}
                      className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                      {t("removeMember")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="w-8 h-8" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL / ALERT DIALOG (Döngü Dışında) */}
      <AlertDialog
        open={!!memberToDelete}
        onOpenChange={(open) => {
          // Eğer dialog dışına tıklanıp kapatılırsa state'i sıfırla
          if (!open) setMemberToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("deleteDialog.title") || "Emin misiniz?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.description") ||
                "Bu işlem geri alınamaz. Bu kullanıcı projeden çıkarılacak ve tüm erişim yetkilerini kaybedecek."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("deleteDialog.cancel") || "İptal"}
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault(); // Otomatik kapanmayı engelle
                confirmDelete();
              }}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("deleteDialog.deleting") || "Siliniyor..."}
                </>
              ) : (
                t("deleteDialog.confirm") || "Evet, Çıkar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
