import type { Metadata } from "next";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore the services we offer.",
};

export default function ServicesPage() {
  return (
    <Container className="py-20 sm:py-24">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Our Services
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          Replace this page with the client&apos;s service offerings. Use cards,
          grids, or detailed sections as appropriate.
        </p>
      </div>
    </Container>
  );
}
