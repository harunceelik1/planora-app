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
import { UserCircle2, UserPlus, AlertTriangle } from "lucide-react";
import { Issue } from "@/types/project";
import { updateIssueAssignee } from "@/actions/issue-actions";
import { Spinner } from "@/components/ui/spinner";

export interface AssigneeUser {
  id: string;
  name: string | null;
  image?: string | null;
  email?: string | null;
}

type UserRole = "OWNER" | "ADMIN" | "MEMBER";

interface IssueAssigneeSelectorProps {
  issue: Issue;
  projectId: string;
  members: AssigneeUser[];
  currentUserRole?: UserRole;
}

export function IssueAssigneeSelector({
  issue,
  members,
  projectId,
  currentUserRole = "MEMBER",
}: IssueAssigneeSelectorProps) {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const [isLoading, setIsLoading] = useState(false);

  // MEMBER atama yapamaz yetki kontrolü
  const canAssign = currentUserRole !== "MEMBER";

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
    // Güvenlik: Eğer atama yetkisi yoksa fonksiyonu hiç çalıştırma
    if (!canAssign) return;

    setIsLoading(true);
    const previousAssignee = assignee;

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
          // DİKKAT: Sadece isLoading durumunda tıklamayı engelliyoruz.
          // canAssign durumunda ENGELLEMİYORUZ ki Dropdown açılsın ve uyarıyı görsünler.
          disabled={isLoading} 
          className={`flex items-center justify-center rounded-full transition-all outline-none 
            ${isLoading ? "cursor-not-allowed opacity-50" : "hover:ring-2 hover:ring-slate-200"}
          `}
        >
          {isLoading ? (
            <div className="h-7 w-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
              <Spinner className="absolute h-4 w-4 animate-spin text-slate-400" />
            </div>
          ) : assignee ? (
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
            <div
              className="h-7 w-7 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <UserPlus size={14} />
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* MEMBER ise bu uyarıyı en üstte gösteririz (ikonlu, okunaklı bir kart görünümü) */}
        {!canAssign && (
          <div className="px-3 py-2 flex items-start gap-3 bg-amber-50 border-b border-amber-100">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="flex flex-col text-amber-800">
              <span className="text-sm font-semibold">Sadece yöneticiler atama yapabilir</span>
              <span className="text-xs text-amber-700/90">Atama yapmak için proje yöneticisine başvurun veya rolünüzü yükseltin.</span>
            </div>
          </div>
        )}

        <div className="px-3 py-2 text-sm font-medium text-slate-700">
          Kime atansın?
        </div>

        {members.map((member) => (
          <DropdownMenuItem
            key={member.id}
            onClick={() => handleAssign(member.id)}
            // MEMBER ise butonları inaktif (disabled) yaparız
            disabled={!canAssign}
            className={`flex items-center gap-2 ${!canAssign ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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
              disabled={!canAssign}
              className={`text-red-600 focus:text-red-600 focus:bg-red-50 ${!canAssign ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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