"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Comment } from "@/types/project";
import { getActivityMessage } from "./activity-messages";

interface TaskActivitySectionProps {
  activities: any[];
  comments: Comment[];
  loadingActivities: boolean;
  currentUser?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function TaskActivitySection({
  activities,
  comments,
  loadingActivities,
  currentUser,
}: TaskActivitySectionProps) {
  const t = useTranslations("TaskDetail");
  const formatI18n = useFormatter();

  return (
    <div className="space-y-4 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
      <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {t("activityAndComments")}
      </h3>

      {/* ACTIVITIES FEED */}
      {loadingActivities ? (
        <div className="text-sm text-slate-400">{t("activity.loading")}</div>
      ) : activities.length === 0 ? (
        <div className="text-sm text-slate-400">{t("activity.noActivities")}</div>
      ) : (
        <div className="space-y-4">
          {activities.map((a) => (
            <div key={a.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={a.user?.image || undefined} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                  {a.user?.name ? a.user.name.charAt(0) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {a.user?.name || t("unknownUser")}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-400">
                    {formatI18n.dateTime(new Date(a.createdAt), {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                  {getActivityMessage(a, t)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMMENTS */}
      <div className="space-y-5">
        {comments.map((comment: Comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8 border">
              <AvatarImage
                src={
                  comment.user?.image ||
                  (comment.user?.id === currentUser?.id
                    ? currentUser?.image || undefined
                    : undefined)
                }
              />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                {comment.user?.name ? comment.user.name.charAt(0) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {comment.user?.name || t("unknownUser")}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-400">
                  {formatI18n.dateTime(new Date(comment.createdAt), {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
