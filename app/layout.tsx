import "./globals.css";
import type { Metadata } from "next";
import ToastContainer from "@/components/ToastContainer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Teisingas metadataBase nustatymas
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Susikurk savo dizainą | Siemka.lt",
  description:
    "Interaktyvus įrankis, leidžiantis susikurti unikalius marškinėlius ar džemperius su savo logotipu.",
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: "Susikurk savo marškinėlių dizainą",
    description: "Įkelk savo logotipą ir matyk, kaip jis atrodys ant rūbų.",
    url: "https://app.siemka.lt",
    siteName: "Siemka.lt",
    locale: "lt_LT",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="lt" suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow bg-gray-50 py-8">{children}</main>
          <Footer />
        </div>
        <ToastContainer />
      </body>
    </html>
  );
}
