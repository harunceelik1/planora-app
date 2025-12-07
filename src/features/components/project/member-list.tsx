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
} from "lucide-react";
import { useMemberRole } from "@/hooks/useMemberRole";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Member {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface MembersListProps {
  projectId: string;
  members: Member[];
  currentUserId: string;
  ownerId: string; // 👈 YENİ: Projenin gerçek sahibinin ID'si
  onUpdate?: () => void;
}

export function MembersList({
  projectId,
  members,
  currentUserId,
  ownerId, // 👈 YENİ
  onUpdate,
}: MembersListProps) {
  const { changeRole, isLoading } = useMemberRole();

  // İşlemi yapan kişi (currentUserId), projenin sahibi (ownerId) mi?
  const isCurrentUserOwner = currentUserId === ownerId;

  const handleRoleChange = async (userId: string, role: "ADMIN" | "MEMBER") => {
    const success = await changeRole({ projectId, userId, role });
    if (success && onUpdate) {
      onUpdate();
    }
  };

  return (
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
                    <Crown className="h-2.5 w-2.5" /> Lider
                  </Badge>
                )}
                {member.role === "ADMIN" && (
                  <Badge
                    variant="secondary"
                    className="text-[9px] px-1.5 h-4 gap-1 bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200"
                  >
                    <ShieldCheck className="h-2.5 w-2.5" /> Yönetici
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {member.user.email}
              </p>
            </div>
          </div>

          {/* SAĞ TARAF: AKSİYON */}
          <div className="flex items-center justify-end">
            {/* Kural: 
               1. Ben Sahipsem (isCurrentUserOwner)
               2. VE Karşımdaki kişi Sahip DEĞİLSE (member.id !== ownerId)
               3. O zaman menüyü göster.
            */}
            {isCurrentUserOwner && member.id !== ownerId ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {member.role === "MEMBER" ? (
                    <DropdownMenuItem
                      disabled={isLoading}
                      onClick={() => handleRoleChange(member.id, "ADMIN")}
                      className="text-blue-600 focus:text-blue-700 cursor-pointer"
                    >
                      <Shield className="mr-2 h-4 w-4" /> Yönetici Yap
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      disabled={isLoading}
                      onClick={() => handleRoleChange(member.id, "MEMBER")}
                      className="text-red-600 focus:text-red-700 cursor-pointer"
                    >
                      <ShieldAlert className="mr-2 h-4 w-4" /> Yöneticiliği Al
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Eğer buton yoksa düzen bozulmasın diye boş div
              <div className="w-8 h-8" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
