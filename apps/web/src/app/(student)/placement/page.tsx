import { getSession } from "@/lib/session";
import { PlacementTestView } from "@/features/placement";

export default async function PlacementPage() {
  const session = await getSession();

  return <PlacementTestView userId={session?.userId} />;
}
