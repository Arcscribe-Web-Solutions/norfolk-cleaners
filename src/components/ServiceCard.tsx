import type { ServiceItem } from "@/lib/site-config";

export default function ServiceCard({ title, description, icon }: ServiceItem) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md">
      <span className="text-3xl">{icon}</span>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}
