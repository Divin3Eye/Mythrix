import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";
import { NotificationList, type NotificationItem } from "@/components/notifications/notification-list";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const userId = await requireUser();
  const supabase = await createClient();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, title, body, link, read_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const items: NotificationItem[] = (notifications ?? []).map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    link: n.link,
    read_at: n.read_at,
    created_at: n.created_at,
  }));

  return (
    <NotificationList notifications={items} />
  );
}
