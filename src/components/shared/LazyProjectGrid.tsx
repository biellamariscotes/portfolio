"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Project } from "@/types/project";
import dynamic from "next/dynamic";

const ProjectCard = dynamic(
  () => import("@/components/shared/ProjectCard").then((mod) => ({ default: mod.ProjectCard })),
  {
    loading: () => <ProjectCardSkeleton />,
    ssr: false,
  }
);

/* ------------------------
 *        SKELETON
 * ------------------------*/
function ProjectCardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-200 h-48 w-full"></div>
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  );
}

/* --------------------------------------
 *    HOOK FOR INTERSECTION OBSERVER
 * --------------------------------------*/

function useIntersectionObserver(callback: (isIntersecting: boolean) => void, options: IntersectionObserverInit = {}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => callback(entry.isIntersecting), {
      root: null,
      rootMargin: "100px", // Increased margin for better UX
      threshold: 0.1,
      ...options,
    });

    const element = ref.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [callback, options]);

  return ref;
}

/* --------------------------------------
 *    INDIV PROJ. CARD LAZY LOAD
 * --------------------------------------*/

function LazyProjectItem({
  project,
  index,
  onVisible,
  isLoaded,
}: {
  project: Project;
  index: number;
  onVisible: (index: number) => void;
  isLoaded: boolean;
}) {
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  const handleIntersection = useCallback(
    (isIntersecting: boolean) => {
      if (isIntersecting && !hasBeenVisible) {
        setHasBeenVisible(true);
        onVisible(index);
      }
    },
    [index, onVisible, hasBeenVisible]
  );

  const elementRef = useIntersectionObserver(handleIntersection);

  // Memoize the animation style to prevent recalculation
  const animationStyle = useMemo(
    () => ({
      animationDelay: `${index * 50}ms`, // Reduced delay for faster appearance
      animationFillMode: "both" as const,
    }),
    [index]
  );

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-500 ease-out ${
        isLoaded || hasBeenVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={animationStyle}
    >
      {isLoaded || hasBeenVisible ? <ProjectCard project={project} /> : <ProjectCardSkeleton />}
    </div>
  );
}

/* --------------------------------------
 *    VIRTUAL SCROLLING PLACEHOLDER
 * --------------------------------------*/
function VirtualPlaceholder({ height = 300 }: { height?: number }) {
  return (
    <div
      className="w-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
      style={{ height }}
    >
      <div className="text-gray-400 text-center">
        <div className="w-8 h-8 mx-auto mb-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
        <p className="text-sm">Loading more projects...</p>
      </div>
    </div>
  );
}

/* -----------------------------
 *      MAIN PROJECT GRID
 * ----------------------------*/

interface LazyProjectGridProps {
  projects: Project[];
  initialLoad?: number;
  batchSize?: number; // Number of items to load per batch
  enableVirtualization?: boolean; // Enable for very large lists
}

export function LazyProjectGrid({
  projects,
  initialLoad = 3,
  batchSize = 3,
  enableVirtualization = false,
}: LazyProjectGridProps) {
  const [loadedItems, setLoadedItems] = useState<Set<number>>(new Set());
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial items immediately
  useEffect(() => {
    const initialItems = new Set(Array.from({ length: Math.min(initialLoad, projects.length) }, (_, i) => i));
    setLoadedItems(initialItems);
    setLoadedCount(initialItems.size);
  }, [projects.length, initialLoad]);

  const handleItemVisible = useCallback(
    (index: number) => {
      setLoadedItems((prev) => {
        const newSet = new Set(prev);
        if (!newSet.has(index)) {
          newSet.add(index);
          setLoadedCount(newSet.size);

          // Batch load nearby items for smoother experience
          if (enableVirtualization) {
            setIsLoading(true);
            setTimeout(() => {
              setLoadedItems((currentSet) => {
                const batchSet = new Set(currentSet);
                for (
                  let i = Math.max(0, index - batchSize);
                  i <= Math.min(projects.length - 1, index + batchSize);
                  i++
                ) {
                  batchSet.add(i);
                }
                return batchSet;
              });
              setIsLoading(false);
            }, 100);
          }
        }
        return newSet;
      });
    },
    [batchSize, enableVirtualization, projects.length]
  );

  // Performance monitoring (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const loadPercentage = (loadedCount / projects.length) * 100;
      console.log(`Lazy loading progress: ${loadPercentage.toFixed(1)}% (${loadedCount}/${projects.length})`);
    }
  }, [loadedCount, projects.length]);

  /* ------------------------
   *      MAIN SECTION
   * ------------------------*/

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      {/* {loadedCount < projects.length && (
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700">
              Loading projects... {loadedCount} of {projects.length}
            </span>
          </div>
          <div className="w-32 bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(loadedCount / projects.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )} */}

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <LazyProjectItem
            key={project.slug}
            project={project}
            index={index}
            onVisible={handleItemVisible}
            isLoaded={loadedItems.has(index)}
          />
        ))}
      </div>

      {/* Loading indicator for batch loading */}
      {isLoading && enableVirtualization && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: batchSize }).map((_, i) => (
            <VirtualPlaceholder key={`placeholder-${i}`} />
          ))}
        </div>
      )}

      {/* Completion message */}
      {/* {loadedCount === projects.length && projects.length > initialLoad && (
        <div className="text-center py-8">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            All projects loaded ({projects.length})
          </div>
        </div>
      )} */}
    </div>
  );
}
