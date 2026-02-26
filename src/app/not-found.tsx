import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gray-100 text-gray-800"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <div className="text-center">
        <h1 className="text-[48px] font-bold text-gray-400">404</h1>
        <p className="mt-1 text-[12px] text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block bg-[#2563eb] text-white px-4 py-1.5 rounded-sm text-[12px] font-bold hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
