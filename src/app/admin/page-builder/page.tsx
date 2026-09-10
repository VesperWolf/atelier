import { getPageSections } from "@/lib/actions/page-builder";
import { PageBuilderClient } from "@/components/admin/page-builder/page-builder-client";

export default async function PageBuilderPage() {
  const sections = await getPageSections("homepage");
  return (
    <PageBuilderClient initialSections={sections ?? []} />
  );
}
