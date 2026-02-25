import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Image src="/logo.png" alt="Norfolk Cleaners" width={140} height={32} className="h-6 w-auto" />
            <p className="mt-2 text-sm text-slate-500">
              {siteConfig.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Navigate
            </h4>
            <ul className="mt-3 space-y-2">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-600 transition-colors hover:text-cyan-600"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Legal
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-slate-600 transition-colors hover:text-cyan-600"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-slate-600 transition-colors hover:text-cyan-600"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Arcscribe Attribution */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Built By
            </h4>
            <div className="mt-3">
              <a
                href={siteConfig.arcscribe.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-slate-900 transition-colors hover:text-cyan-600"
              >
                {siteConfig.arcscribe.name}
              </a>
              <p className="mt-1 text-xs text-slate-400">
                {siteConfig.arcscribe.tagline}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="text-center text-xs text-slate-400">
            &copy; {year} {siteConfig.name}. All rights reserved. Website by{" "}
            <a
              href={siteConfig.arcscribe.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-cyan-600"
            >
              Arcscribe
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
