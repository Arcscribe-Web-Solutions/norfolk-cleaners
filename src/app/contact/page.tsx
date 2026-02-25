import type { Metadata } from "next";
import Container from "@/components/Container";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with us.",
};

export default function ContactPage() {
  return (
    <Container className="py-20 sm:py-24">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Contact Us
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          We&apos;d love to hear from you. Fill out the form below and we&apos;ll
          get back to you as soon as possible.
        </p>

        <ContactForm />
      </div>
    </Container>
  );
}
