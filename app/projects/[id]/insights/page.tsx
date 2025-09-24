import { Metadata } from "next";
import { Suspense } from "react";

import { getProject } from "@/lib/api";
import { Project } from "@/lib/types";
import ClientShell from "./ClientShell";

export const revalidate = 0;

type PageProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await getProject(params.id);
  return {
    title: `${project.name} · Insights`,
  };
}

export default async function InsightsPage({ params, searchParams }: PageProps) {
  const project: Project = await getProject(params.id);
  const viaParam = typeof searchParams.via === "string" ? searchParams.via : undefined;

  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading project…</div>}>
      <ClientShell project={project} via={viaParam} />
    </Suspense>
  );
}
