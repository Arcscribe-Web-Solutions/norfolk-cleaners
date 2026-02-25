import type { ServiceItem } from "@/lib/site-config";

export default function ServiceCard({ title, description, icon }: ServiceItem) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800">
      <span className="text-3xl">{icon}</span>
      <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}
