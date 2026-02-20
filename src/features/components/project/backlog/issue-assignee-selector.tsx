"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle2, UserPlus, Loader2 } from "lucide-react"; // Loader2 eklendi
import { Issue } from "@/types/project";
import { updateIssueAssignee } from "@/actions/issue-actions";
import { Spinner } from "@/components/ui/spinner";

export interface AssigneeUser {
  id: string;
  name: string | null;
  image?: string | null;
  email?: string | null;
}

interface IssueAssigneeSelectorProps {
  issue: Issue;
  projectId: string;
  members: AssigneeUser[];
}

export function IssueAssigneeSelector({
  issue,
  members,
  projectId,
}: IssueAssigneeSelectorProps) {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  // Yükleniyor durumu için state
  const [isLoading, setIsLoading] = useState(false);

  const [assignee, setAssignee] = useState<AssigneeUser | null>(
    issue.assignee
      ? {
          id: issue.assignee.id,
          name: issue.assignee.name || null,
          image: issue.assignee.image || null,
        }
      : null,
  );

  const handleAssign = async (memberId: string) => {
    // 1. Yükleniyor başlat
    setIsLoading(true);

    const previousAssignee = assignee;

    // Local state güncellemesi (Optimistic)
    // Bunu loading'den sonra yapıyoruz ama loading true olduğu için
    // kullanıcı zaten spinner görecek.
    if (memberId === "") {
      setAssignee(null);
    } else {
      const selectedMember = members.find((m) => m.id === memberId) || null;
      setAssignee(selectedMember);
    }

    try {
      const result = await updateIssueAssignee(issue.id, memberId, projectId);

      if (result?.error) {
        throw new Error(result.error);
      }

      await mutate(`/api/project/${projectId}`);
      router.refresh();
    } catch (error) {
      console.error("Atama hatası:", error);
      setAssignee(previousAssignee);
    } finally {
      // 2. İşlem bittiğinde (başarılı veya hatalı) yükleniyor'u kapat
      setIsLoading(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "??";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={isLoading} // Yüklenirken tıklamayı engelle
          className="flex items-center justify-center rounded-full hover:ring-2 hover:ring-slate-200 transition-all outline-none disabled:cursor-not-allowed"
        >
          {/* DURUM KONTROLÜ: Loading mi? */}
          {isLoading ? (
            <div className="h-7 w-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
              <Spinner className="absolute h-4 w-4 animate-spin text-slate-400" />
            </div>
          ) : assignee ? (
            // Atanmış kişi varsa
            <Avatar className="h-7 w-7 border-2 border-white shadow-sm cursor-pointer">
              <AvatarImage
                src={assignee.image || ""}
                referrerPolicy="no-referrer"
              />
              <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700 font-bold">
                {getInitials(assignee.name)}
              </AvatarFallback>
            </Avatar>
          ) : (
            // Kimse yoksa (+) butonu
            <div
              className="h-7 w-7 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Ata"
            >
              <UserPlus size={14} />
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Kime atansın?
        </div>

        {members.map((member) => (
          <DropdownMenuItem
            key={member.id}
            onClick={() => handleAssign(member.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={member.image || ""}
                referrerPolicy="no-referrer"
              />
              <AvatarFallback className="text-[10px]">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm truncate">{member.name || "İsimsiz"}</span>
          </DropdownMenuItem>
        ))}

        {assignee && (
          <>
            <div className="h-px bg-slate-100 my-1" />
            <DropdownMenuItem
              onClick={() => handleAssign("")}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
            >
              <UserCircle2 className="mr-2 h-4 w-4" />
              <span>Atamayı Kaldır</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
