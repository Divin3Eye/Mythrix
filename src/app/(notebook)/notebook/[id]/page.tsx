import { redirect } from "next/navigation";

export default async function NotebookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/notebook/${id}/sources`);
}
