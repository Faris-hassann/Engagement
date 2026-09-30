import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import {
  Amiri,
  Aref_Ruqaa,
  Cormorant_Garamond,
  Lora,
  Ms_Madi,
  The_Nautigal,
  Uchen,
  Viaoda_Libre,
} from "next/font/google";
import { dictionaries, isLocale, locales } from "@/lib/i18n";
import "../globals.css";

const viaoda = Viaoda_Libre({ weight: "400", subsets: ["latin"], variable: "--font-viaoda" });
const nautigal = The_Nautigal({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-nautigal" });
const madi = Ms_Madi({ weight: "400", subsets: ["latin"], variable: "--font-madi" });
const cormorant = Cormorant_Garamond({ weight: ["400", "600"], subsets: ["latin"], variable: "--font-cormorant" });
const lora = Lora({ weight: ["400", "600"], subsets: ["latin"], variable: "--font-lora" });
const uchen = Uchen({ weight: "400", subsets: ["latin"], variable: "--font-uchen" });
const amiri = Amiri({ weight: ["400", "700"], subsets: ["arabic"], variable: "--font-amiri" });
const ruqaa = Aref_Ruqaa({ weight: ["400", "700"], subsets: ["arabic"], variable: "--font-ruqaa" });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = dictionaries[isLocale(locale) ? locale : "en"];
  const title = `${t.groom} & ${t.bride}`;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title,
    icons: {
      icon: [{ url: "/Images/favicon.jpeg", type: "image/jpeg" }],
      apple: [{ url: "/Images/favicon.jpeg" }],
    },
    description:`${t.saveTheDate} · ${t.coverDate}`,
    openGraph: { title, description: t.coverDate, images: ["/Images/hero.jpg"] },
    alternates: { languages: { en: "/en", ar: "/ar" } },
  };
}

export const viewport: Viewport = { themeColor: "#511419", width: "device-width", initialScale: 1 };

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const fonts = [viaoda, nautigal, madi, cormorant, lora, uchen, amiri, ruqaa].map((f) => f.variable).join(" ");
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={fonts}>
      <body>{children}</body>
    </html>
  );
}
