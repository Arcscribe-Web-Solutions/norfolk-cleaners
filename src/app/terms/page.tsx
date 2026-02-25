import type { Metadata } from "next";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <Container className="py-20 sm:py-24">
      <div className="prose prose-zinc max-w-2xl dark:prose-invert">
        <h1>Terms of Service</h1>
        <p className="lead">
          Replace this with the client&apos;s terms of service content.
        </p>
        <p>
          This page should outline the terms under which the website and its
          services are provided, including disclaimers, limitations of liability,
          and governing law.
        </p>
      </div>
    </Container>
  );
}
