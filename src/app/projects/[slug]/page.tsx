import { fetchProjectBySlug, fetchProjects } from "@/lib/api";
import { Project } from "@/types/project";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { PageProps } from "@/types/page";
import Breadcrumbs from "@/components/shared/BreadCrumbsNav";
import { Badge } from "@/components/ui/Badge";
import { TechnologiesList } from "@/components/shared/TechBadge";
import clsx from "clsx";

/* ------------------------
            SCRIPTS
    ------------------------*/

/* Metadata Configuration */
const statusVariants: Record<string, "success" | "info" | "destructive"> = {
  complete: "success",
  ongoing: "info",
  discontinued: "destructive",
};

/* Static Paths Generation */
export async function generateStaticParams() {
  try {
    const projects = await fetchProjects();
    return projects.map((project: Project) => ({
      slug: project.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

/* Metadata Configuration */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const project = await fetchProjectBySlug(slug);

    const enhancedDescription = project.technologies
      ? `${project.description} Built with: ${project.technologies.join(", ")}`
      : project.description;

    return {
      title: project.title,
      description: enhancedDescription,
      keywords: project.technologies,
      other: {
        status: project.status,
        ...(project.technologies && {
          technologies: project.technologies.join(", "),
        }),
      },
      openGraph: {
        title: project.title,
        description: enhancedDescription,
        images: [project.image],
        url: project.link,
      },
    };
  } catch {
    return {
      title: "Project Not Found",
    };
  }
}

/* ------------------------
 *        MAIN PAGE
 * ------------------------*/
export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await fetchProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="container sm:px-20 mx-auto px-4 py-8">
      <div className="pl-1 pb-5">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Projects", href: "/projects" }, { label: project.title }]}
        />
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-64 md:h-96 bg-gray-200">
          {project.type === "system" ? (
            <video src={`/media/system/${project.image}`} controls playsInline className="w-full h-full object-cover" />
          ) : (
            <Image
              src={`/media/ui/${project.image}`}
              alt={project.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          )}
        </div>

        <div className="p-8">
          <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">{project.description}</p>

          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-3">Project Information</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Project ID */}
              <div>
                <strong className="text-gray-700">Project ID:</strong>
                <span className="ml-2 text-gray-600">{project.slug}</span>
              </div>
              {project.type === "system" && project.technologies && (
                <div className="technologies-section">
                  <strong className="text-gray-700">Technologies Used: </strong>
                  <TechnologiesList
                    technologies={project.technologies}
                    size="sm"
                    showIcon={true}
                    className="flex flex-wrap gap-2 mt-2"
                  />
                </div>
              )}
              {/* Status */}
              <div>
                <strong className="text-gray-700">Status:</strong>
                <Badge variant={statusVariants[project.status] ?? "secondary"} className={clsx("ml-2")}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <div className="flex gap-4">
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                <Button className="cursor-pointer">{project.type === "ui" ? "View Figma" : "View Source Code"}</Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
