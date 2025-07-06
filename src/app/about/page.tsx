"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRoughNotation } from "@/hooks/useRoughNotation";
import { Button } from "@/components/ui/Button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/Carousel";
import { TechnologyBadge } from "@/components/shared/TechBadge";
import { fetchExperiences } from "@/lib/api";
import { Experience } from "@/types/experience";
import { techStack } from "@/const/tech-stack";

export default function About() {
  /* ------------------------
   *        SCRIPTS
   * ------------------------*/

  const { elementRef, handleMouseEnter, handleMouseLeave } = useRoughNotation();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState(new Set());

  useEffect(() => {
    const loadExperiences = async () => {
      try {
        setIsLoading(true);
        const data = await fetchExperiences();
        setExperiences(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load experiences");
        console.error("Error loading experiences:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadExperiences();
  }, []);

  const handleResumeClick = () => {
    window.open("files/Resume.pdf", "_blank");
  };

  const toggleExpanded = (id: string | number) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const truncateText = (text: string, maxLength: number = 150): string => {
    if (!text) return "";
    return text.length <= maxLength ? text : text.substring(0, maxLength) + "...";
  };

  /* ------------------------
   *        MAIN PAGE
   * ------------------------*/
  return (
    <section className="pt-10 pb-10 px-6">
      {/* First Row - Profile Section */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
        {/* Profile Image */}
        <div className="flex justify-center">
          <div className="w-60 md:w-90">
            <Image
              src="/media/image-self.png"
              alt="Biella's profile picture"
              width={600}
              height={600}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-white">
          <div className="light-green-background">
            <div className="profile-card">
              <h1 className="title">
                Hi, the name is <span className="highlight">Biella</span> ♡
              </h1>
              <p className="text-lg mb-6">
                I design and{" "}
                <span
                  ref={elementRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="cursor-pointer text-primary font-medium"
                >
                  develop
                </span>{" "}
                web applications.
              </p>

              <div className="text-base space-y-2 mb-6">
                <p>
                  A graduating student with a keen interest in creating web applications that (hopefully) don’t crash. I
                  am also exploring the fundamentals of machine learning and its potential applications in real-world
                  scenarios.{" "}
                </p>
              </div>

              <Button variant="accent" className="cursor-pointer" onClick={handleResumeClick}>
                See Resume
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row - Tech Stack */}
      <div className="max-w-6xl mx-auto mb-8">
        <h2 className="text-3xl font-bold text-left sm:text-center text-primary mb-8">Tech Stack</h2>

        {/* Scrolling Tech Stack */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll space-x-4 pb-3">
            {/* Duplicate the array for seamless scrolling */}
            {[...techStack, ...techStack].map((tech, index) => (
              <div key={`${tech}-${index}`} className="flex-shrink-0">
                <TechnologyBadge
                  technology={tech}
                  size="md"
                  showIcon={true}
                  className="hover:shadow-md transition-shadow whitespace-nowrap"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Third Row - Experiences Carousel */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-left mb-8 sm:text-center text-primary">Experiences</h2>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg">
            <p className="font-medium">Failed to load experiences</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center text-gray-500 p-6">
            <p>No experiences found.</p>
          </div>
        ) : (
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {experiences.map((experience) => {
                const isExpanded = expandedCards.has(experience.id);
                const shouldTruncate = experience.desc && experience.desc.length > 150;

                return (
                  <CarouselItem key={experience.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="rounded-lg border overflow-hidden hover:shadow-xl transition-shadow">
                      {/* Experience Image */}
                      <div className="relative h-48 bg-gray-200">
                        {experience.img ? (
                          <Image
                            src={`/media/experience/${experience.img}`}
                            alt={experience.company || "Company logo"}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const parent = target.parentElement;
                              if (parent) {
                                target.style.display = "none";
                                parent.innerHTML =
                                  '<div class="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center"><span class="text-white text-lg font-semibold">Experience</span></div>';
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                            <span className="text-white text-lg font-semibold">Experience</span>
                          </div>
                        )}
                      </div>

                      {/* Experience Content */}
                      <div className="p-6">
                        <h3 className="text-2xl font-semibold mb-2">{experience.company}</h3>

                        {/* Role */}
                        {(experience.company || experience.role) && (
                          <div className="text-sm text-gray-600 mb-2">
                            {experience.role && <span className="font-medium">{experience.role}</span>}
                          </div>
                        )}

                        {/* Date Range */}
                        {(experience.startDate || experience.endDate) && (
                          <div className="text-sm text-gray-500 mb-3">
                            {experience.startDate &&
                              new Date(experience.startDate).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                              })}
                            {experience.startDate && experience.endDate && " - "}
                            {experience.endDate &&
                              new Date(experience.endDate).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                              })}
                          </div>
                        )}

                        <div className="text-gray-600 mb-4">
                          <p className={!isExpanded ? "line-clamp-3" : ""}>
                            {isExpanded ? experience.desc : truncateText(experience.desc)}
                          </p>
                          {shouldTruncate && (
                            <button
                              onClick={() => toggleExpanded(experience.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 focus:outline-none focus:underline"
                            >
                              {isExpanded ? "See less" : "See more..."}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}
      </div>
    </section>
  );
}
