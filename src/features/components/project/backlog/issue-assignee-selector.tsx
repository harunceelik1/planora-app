"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle2, UserPlus } from "lucide-react";
import { Issue } from "@/types/project";
import { updateIssueAssignee } from "@/actions/issue-actions";

// Tip tanımları (Hata almamak için buraya koyduk)
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
  // Başlangıç değerini ayarla
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
    // 1. ESKİ DEĞERİ SAKLA (Hata olursa geri dönmek için)
    const previousAssignee = assignee;

    // 2. OPTIMISTIC UPDATE (Arayüzü anında güncelle - Hız hissi)
    // Eğer memberId boşsa kaldırma işlemi, doluysa atama işlemi
    if (memberId === "") {
      setAssignee(null);
    } else {
      const selectedMember = members.find((m) => m.id === memberId) || null;
      setAssignee(selectedMember);
    }

    // 3. SERVER ACTION ÇAĞRISI (Gerçek işlem)
    try {
      // Server Action'ı çağırıyoruz. Axios yok, URL yok. Fonksiyon çağırır gibi.
      const result = await updateIssueAssignee(issue.id, memberId, projectId);

      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Atama hatası:", error);
      setAssignee(previousAssignee);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "??";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center rounded-full hover:ring-2 hover:ring-slate-200 transition-all outline-none">
          {assignee ? (
            <Avatar className="h-7 w-7 border-2 border-white shadow-sm cursor-pointer">
              <AvatarImage src={assignee.image || ""} />
              <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700 font-bold">
                {getInitials(assignee.name)}
              </AvatarFallback>
            </Avatar>
          ) : (
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
              <AvatarImage src={member.image || ""} />
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
