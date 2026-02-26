import AppNav from "@/components/AppNav";
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
      <div
        className="h-screen w-screen overflow-hidden flex flex-col text-gray-800 bg-gray-100"
        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        <AppNav />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </AuthProviderWrapper>
  );
}
