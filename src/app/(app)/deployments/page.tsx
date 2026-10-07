import type { Metadata } from "next";
import { workspace } from "@/content/copy";

export const metadata: Metadata = { title: workspace.deployments.title };

/** STUB: replaced by its feature builder. */
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-3.5 pt-7">
      <h1 className="font-semibold text-2xl text-bone">
        {workspace.deployments.title}
      </h1>
    </div>
  );
}
