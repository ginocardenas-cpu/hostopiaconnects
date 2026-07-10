import { getTranslations } from "next-intl/server";
import { BrandStudioPageClient } from "@/components/BrandStudioPageClient";

export default async function BrandStudioPage() {
  await getTranslations("brandStudio");
  return <BrandStudioPageClient />;
}
