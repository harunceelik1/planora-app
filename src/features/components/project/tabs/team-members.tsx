import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { MapPin, Briefcase, Mail, Users } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { ProjectMember } from "@/types/project";

interface TeamMembersProps {
  members: ProjectMember[];
}

const roleConfig = {
  OWNER: {
    labelKey: "roles.owner",
    className:
      "bg-violet-100 text-violet-700 border-transparent dark:bg-violet-900/40 dark:text-violet-300",
    dotClassName: "bg-violet-500",
  },
  ADMIN: {
    labelKey: "roles.admin",
    className:
      "bg-sky-100 text-sky-700 border-transparent dark:bg-sky-900/40 dark:text-sky-300",
    dotClassName: "bg-sky-500",
  },
  MEMBER: {
    labelKey: "roles.member",
    className:
      "bg-slate-100 text-slate-600 border-transparent dark:bg-slate-800 dark:text-slate-400",
    dotClassName: "bg-slate-400",
  },
} as const;

export default function TeamMembers({ members }: TeamMembersProps) {
  const t = useTranslations("ProjectDetails");

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30 px-6 py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Users className="h-6 w-6 text-muted-foreground/60" />
        </div>
        <p className="text-base font-semibold text-foreground">
          {t("views.team.noMembers.title")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
          {t("views.team.noMembers.description")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {members.map((member) => {
        const role =
          member.role === "OWNER"
            ? roleConfig.OWNER
            : member.role === "ADMIN"
            ? roleConfig.ADMIN
            : roleConfig.MEMBER;

        return (
          <div
            key={member.id}
            className="group relative flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 transition-all duration-200 hover:border-border hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <Avatar className="h-11 w-11 ring-2 ring-background shadow-sm">
                    <AvatarImage
                      src={member.user.image || ""}
                      referrerPolicy="no-referrer"
                      alt={member.user.name || ""}
                    />
                    <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-violet-100 to-sky-100 text-violet-700 dark:from-violet-900/50 dark:to-sky-900/50 dark:text-violet-300">
                      {getInitials(
                        member.user.name || member.user.email || ""
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card ${role.dotClassName}`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground leading-tight">
                    {member.user.name ||
                      member.user.email ||
                      t("views.team.unknown")}
                  </p>
                  <p className="truncate text-xs text-muted-foreground mt-0.5">
                    {member.user.email || t("views.team.emailMissing")}
                  </p>
                </div>
              </div>

              <Badge
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${role.className}`}
              >
                {t(role.labelKey)}
              </Badge>
            </div>

            <div className="h-px bg-border/50" />

            <div className="space-y-2.5">
              <DetailRow
                icon={<Briefcase className="h-3.5 w-3.5" />}
                value={member.user.jobTitle || t("views.team.noJobTitle")}
                muted={!member.user.jobTitle}
              />
              <DetailRow
                icon={<MapPin className="h-3.5 w-3.5" />}
                value={member.user.location || t("views.team.noLocation")}
                muted={!member.user.location}
              />
              <DetailRow
                icon={<Mail className="h-3.5 w-3.5" />}
                value={member.user.email || t("views.team.emailMissing")}
                muted={!member.user.email}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DetailRow({
  icon,
  value,
  muted,
}: {
  icon: React.ReactNode;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 text-xs">
      <span
        className={`shrink-0 ${muted ? "text-muted-foreground/50" : "text-muted-foreground"}`}
      >
        {icon}
      </span>
      <span
        className={`truncate ${muted ? "text-muted-foreground/60 italic" : "text-muted-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}
