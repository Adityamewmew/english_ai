import { ModuleDetailView } from "@/features/curriculum/components/module-detail-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ModuleDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ModuleDetailView moduleId={id} />;
}
