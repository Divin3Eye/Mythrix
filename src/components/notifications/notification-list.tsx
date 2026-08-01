"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Check, Info, AlertTriangle, Sparkles } from "lucide-react";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";
import { relativeTime } from "@/lib/format";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

const TYPE_ICONS: Record<string, { icon: typeof Bell; color: string }> = {
  info: { icon: Info, color: "#60a5fa" },
  warning: { icon: AlertTriangle, color: "#fbbf24" },
  success: { icon: Check, color: "#34d399" },
  artifact: { icon: Sparkles, color: "#a78bfa" },
};

export function NotificationList({ notifications }: { notifications: NotificationItem[] }) {
  const router = useRouter();
  const unread = notifications.filter((n) => !n.read_at).length;

  async function handleMarkRead(id: string) {
    try {
      await markNotificationRead(id);
      router.refresh();
    } catch {
      /* noop */
    }
  }

  async function handleMarkAll() {
    try {
      await markAllNotificationsRead();
      router.refresh();
    } catch {
      /* noop */
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Notifications</h1>
          <p className="text-sm text-white/70 mt-1">
            {unread > 0 ? `${unread} unread` : "You're all caught up"}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={handleMarkAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface hover:bg-surface-hover text-white/70 hover:text-white text-sm transition-colors"
          >
            <Check size={14} />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-14 w-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
            <Bell size={24} className="text-white/40" />
          </div>
          <h2 className="text-white font-medium">No notifications</h2>
          <p className="text-white/70 text-sm mt-1.5 max-w-sm">
            When processing completes, artifacts finish generating, or something
            needs your attention, it will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const typeIcon = TYPE_ICONS[notification.type] ?? TYPE_ICONS.info;
            const Icon = typeIcon.icon;
            const unreadNotification = !notification.read_at;

            const inner = (
              <div
                className={`flex items-start gap-3.5 rounded-2xl border px-4 py-3.5 transition-colors ${
                  unreadNotification
                    ? "bg-[rgba(255,255,255,0.06)] border-white/[0.14]"
                    : "bg-[rgba(255,255,255,0.05)] border-white/[0.09]"
                }`}
              >
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: `${typeIcon.color}1a`,
                    color: typeIcon.color,
                  }}
                >
                  <Icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium truncate">
                      {notification.title}
                    </p>
                    {unreadNotification && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#63e] shrink-0" />
                    )}
                  </div>
                  {notification.body && (
                    <p className="text-white/70 text-xs mt-1 leading-relaxed line-clamp-2">
                      {notification.body}
                    </p>
                  )}
                  <p className="text-[11px] text-white/50 mt-1.5">
                    {relativeTime(notification.created_at)}
                  </p>
                </div>
                {unreadNotification && (
                  <button
                    onClick={() => handleMarkRead(notification.id)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-white/50 hover:text-white/70 hover:bg-surface-hover transition-colors shrink-0"
                    aria-label="Mark as read"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            );

            if (notification.link) {
              return (
                <Link key={notification.id} href={notification.link}>
                  {inner}
                </Link>
              );
            }
            return <div key={notification.id}>{inner}</div>;
          })}
        </div>
      )}
    </>
  );
}
