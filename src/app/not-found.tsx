import Container from "@/components/Container";
import Button from "@/components/Button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-zinc-900 dark:text-white">404</h1>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <div className="mt-8">
        <Button href="/">Go Home</Button>
      </div>
    </Container>
  );
}
