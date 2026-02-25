import Container from "@/components/Container";
import Button from "@/components/Button";
import ServiceCard from "@/components/ServiceCard";
import { siteConfig } from "@/lib/site-config";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-zinc-950">
        <Container className="py-24 sm:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white">
              Welcome to{" "}
              <span className="text-zinc-500 dark:text-zinc-400">
                {siteConfig.name}
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              {siteConfig.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/contact" size="lg">
                Get in Touch
              </Button>
              <Button href="/about" variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
        <Container className="py-20 sm:py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              What We Do
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-600 dark:text-zinc-400">
              Replace this section with your client&apos;s key services or value propositions.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {siteConfig.services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <Container className="py-20 sm:py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Ready to Get Started?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-600 dark:text-zinc-400">
              Get in touch today and let&apos;s discuss how we can help your business grow.
            </p>
            <div className="mt-8">
              <Button href="/contact" size="lg">
                Contact Us
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
