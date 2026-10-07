import { overview } from "@/content/copy";

/** STUB: replaced by its feature builder. */
export function InstancesCard() {
  return (
    <section className="min-h-40 rounded-card border border-line bg-panel p-6">
      <h2 className="font-semibold text-bone text-xl">
        {overview.instances.title}
      </h2>
    </section>
  );
}
