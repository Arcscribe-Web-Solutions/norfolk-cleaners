import type { Metadata } from "next";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <Container className="py-20 sm:py-24">
      <div className="prose prose-slate max-w-2xl">
        <h1>Privacy Policy</h1>
        <p className="lead">
          Replace this with the client&apos;s privacy policy content.
        </p>
        <p>
          This page should outline how personal data is collected, used, stored,
          and shared. Include information about cookies, analytics, third-party
          services, and user rights under GDPR / UK data protection law.
        </p>
      </div>
    </Container>
  );
}
