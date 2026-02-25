import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
              {siteConfig.name}
            </h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {siteConfig.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Navigate
            </h4>
            <ul className="mt-3 space-y-2">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Legal
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Arcscribe Attribution */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Built By
            </h4>
            <div className="mt-3">
              <a
                href={siteConfig.arcscribe.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-zinc-900 transition-colors hover:text-zinc-600 dark:text-white dark:hover:text-zinc-300"
              >
                {siteConfig.arcscribe.name}
              </a>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                {siteConfig.arcscribe.tagline}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
            &copy; {year} {siteConfig.name}. All rights reserved. Website by{" "}
            <a
              href={siteConfig.arcscribe.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-zinc-600 dark:hover:text-zinc-300"
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
