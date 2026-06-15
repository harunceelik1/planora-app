"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

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

  const userName = session?.user?.name || currentUser?.name;

  return (
    // Dış kapsayıcı border-border ile Shadcn'e bağlandı, p-4 yerine daha dengeli bir padding verildi
    <div className="shrink-0 px-6 py-4 border-t border-border ">
      <div className="flex gap-3 items-center">
        {/* Kullanıcı Profil Resmi */}
        <Avatar className="h-8 w-8 border border-border">
          <AvatarImage
            src={session?.user?.image || currentUser?.image || undefined}
          />
          {/* Avatar rengi uygulamanın ana rengine (primary) entegre edildi */}
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>

        {/* Giriş Alanı Kapsayıcısı */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={commentText}
            onChange={(e) => onCommentChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("placeholders.addComment")}
            // Sert mavi odaklanma (ring-blue-500) yerine Shadcn ring efekti getirildi. bg-muted/50 ile derinlik katıldı.
            className={cn(
              "w-full text-sm rounded-full border border-input bg-muted/50 text-foreground pl-4 pr-10 py-2.5",
              "placeholder:text-muted-foreground/60 transition-all",
              "focus:outline-hidden focus:border-muted-foreground/40 focus:ring-2 focus:ring-ring/10 focus:bg-background"
            )}
          />
        </div>

        {/* Gönder Butonu */}
        <Button
          onClick={onSendComment}
          disabled={!commentText.trim()}
          size="icon"
          // Özel bg-blue sınıfları yerine doğrudan Shadcn buton stillerine emanet edildi
          className="rounded-full h-9 w-9 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}