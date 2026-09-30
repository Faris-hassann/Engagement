import { notFound } from "next/navigation";
import Invitation from "@/components/Invitation";
import { isLocale } from "@/lib/i18n";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <Invitation locale={locale} />;
}
