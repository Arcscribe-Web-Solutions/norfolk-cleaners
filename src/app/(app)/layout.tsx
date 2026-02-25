import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProviderWrapper } from "./AuthProviderWrapper";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev =
    process.env.NEXT_STATUS === "development" ||
    process.env.NODE_ENV === "development";

  return (
    <AuthProviderWrapper isDev={isDev}>
      <Header />
      <main className="min-h-[calc(100vh-8rem)]">{children}</main>
      <Footer />
    </AuthProviderWrapper>
  );
}
