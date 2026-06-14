"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFormatter, useTranslations } from "next-intl";
import { getActivityMessage } from "./activity-messages";

interface ActivityFeedProps {
  activities: any[];
  loading: boolean;
}

export function ActivityFeed({ activities, loading }: ActivityFeedProps) {
  const t = useTranslations("TaskDetail");
  const formatI18n = useFormatter();

  if (loading) {
    return (
      <div className="text-sm text-slate-400">
        {t("activity.loading")}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-sm text-slate-400">
        {t("activity.noActivities")}
      </div>
    );
  }

  return (
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
  );
}

