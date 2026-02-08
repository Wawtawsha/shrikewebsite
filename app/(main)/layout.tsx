import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import LenisProvider from "@/components/LenisProvider";
import PageTransition from "@/components/PageTransition";
import "./main.css";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="dark flex flex-col min-h-screen">
      <Navigation />
      <LenisProvider>
        <PageTransition>{children}</PageTransition>
      </LenisProvider>
      <Footer />
    </div>
  );
}
