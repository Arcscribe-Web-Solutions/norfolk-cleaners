import type { Metadata } from "next";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about our business and what we do.",
};

export default function AboutPage() {
  return (
    <Container className="py-20 sm:py-24">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          About Us
        </h1>
        <div className="mt-6 space-y-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          <p>
            Replace this content with information about the client&apos;s business,
            history, mission, and values.
          </p>
          <p>
            This page is a starting point — customise the layout and content to
            suit each client&apos;s needs.
          </p>
        </div>
      </div>
    </Container>
  );
}
