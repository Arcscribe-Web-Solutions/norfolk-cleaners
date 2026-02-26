export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {children}
    </div>
  );
}
