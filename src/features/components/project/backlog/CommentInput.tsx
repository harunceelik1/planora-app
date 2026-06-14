"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

interface CommentInputProps {
  commentText: string;
  currentUser?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onCommentChange: (value: string) => void;
  onSendComment: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function CommentInput({
  commentText,
  currentUser,
  onCommentChange,
  onSendComment,
  onKeyDown,
}: CommentInputProps) {
  const t = useTranslations("TaskDetail");
  const { data: session } = useSession();

  return (
    <div className="shrink-0 p-4 border-t border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800">
      <div className="flex gap-3 items-center">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={session?.user?.image || currentUser?.image || undefined}
          />
          <AvatarFallback className="bg-blue-600 text-white text-xs">
            {(session?.user?.name || currentUser?.name)
              ? (session?.user?.name || currentUser?.name)?.charAt(0).toUpperCase()
              : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 relative">
          <input
            type="text"
            value={commentText}
            onChange={(e) => onCommentChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("placeholders.addComment")}
            className="w-full text-sm rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 pl-4 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <Button
          onClick={onSendComment}
          disabled={!commentText.trim()}
          size="icon"
          className="rounded-full bg-blue-600 hover:bg-blue-700 h-9 w-9"
        >
          <Send className="h-4 w-4 text-white" />
        </Button>
      </div>
    </div>
  );
}
