import { fetchProjects } from "@/lib/api";
import { Project } from "@/types/project";
import { ReactElement, Suspense } from "react";
import { createPageMetadata } from "@/lib/metadata";
import Breadcrumbs from "@/components/shared/BreadCrumbsNav";
import { LazyProjectGrid } from "@/components/shared/LazyProjectGrid";

// Loading skeleton component that matches your card design
function ProjectCardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow-md overflow-hidden">
      {/* Image placeholder */}
      <div className="bg-gray-200 h-48 w-full"></div>

      {/* Content placeholder */}
      <div className="p-6 space-y-4">
        {/* Title placeholder */}
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>

        {/* Description placeholder */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* Button placeholder */}
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  );
}

// Grid skeleton for initial loading
function ProjectGridSkeleton() {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

export const metadata = createPageMetadata("Projects", "All of my projects.");

export default async function ProjectsPage(): Promise<ReactElement> {
  /* ------------------------
   *        SCRIPTS
   * ------------------------*/

  let projects: Project[] = [];
  let error: string | null = null;

  try {
    projects = await fetchProjects();
  } catch (err) {
    error = err instanceof Error ? err.message : "An unknown error occurred";
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Projects</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading projects: {error}
        </div>
      </div>
    );
  }

  const uiProjects = projects.filter((project) => project.type === "ui");
  const systemProjects = projects.filter((project) => project.type === "system");

  /* ------------------------
   *        MAIN PAGE
   * ------------------------*/
  return (
    <div className="container sm:px-20 mx-auto px-6 py-8 space-y-12">
      <section>
        <div className="pl-1 pb-5">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Projects", href: "/projects" },
            ]}
          />
        </div>

        {/* UI Projects Section */}
        <section>
          <h2 className="text-3xl text-gray-900 font-bold mb-4 pl-1">UI Projects</h2>
          {uiProjects.length === 0 ? (
            <p className="text-gray-600">No UI projects found.</p>
          ) : (
            <Suspense fallback={<ProjectGridSkeleton />}>
              <LazyProjectGrid projects={uiProjects} />
            </Suspense>
          )}
        </section>
      </section>

      {/* System Projects Section */}
      <section>
        <h2 className="text-3xl text-gray-900 font-bold mb-4">System Projects</h2>
        {systemProjects.length === 0 ? (
          <p className="text-gray-600">No system projects found.</p>
        ) : (
          <Suspense fallback={<ProjectGridSkeleton />}>
            <LazyProjectGrid projects={systemProjects} />
          </Suspense>
        )}
      </section>
    </div>
  );
}
