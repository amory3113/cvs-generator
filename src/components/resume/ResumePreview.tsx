import { Fragment, type ReactNode } from "react";
import type { Resume } from "@/src/lib/schema";

// Human-readable labels for the snake_case skill category keys.
const skillCategoryLabels: Record<string, string> = {
  mobile: "Mobile",
  web_and_backend: "Web & Backend",
  infrastructure_and_qa: "Infrastructure & QA",
  ai_and_automation: "AI & Automation",
  tools: "Tools",
};

const linkClass = "text-resume-link underline";

// Section title: bold accent-coloured caps with a thin rule underneath.
function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-1.5 break-after-avoid border-b border-resume-accent pb-0.5 text-[15px] font-bold uppercase tracking-wide text-resume-accent">
      {children}
    </h2>
  );
}

// Centered row of items separated by a middle dot.
function DotList({ items }: { items: ReactNode[] }) {
  return (
    <p className="flex flex-wrap justify-center gap-x-2">
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <span aria-hidden="true">·</span>}
          {item}
        </Fragment>
      ))}
    </p>
  );
}

interface ResumePreviewProps {
  data: Resume;
}

export default function ResumePreview({ data }: ResumePreviewProps) {
  const { personalInfo, education, skills, projects } = data;

  const contactItems: ReactNode[] = [
    personalInfo.location,
    personalInfo.phone,
    personalInfo.email && (
      <a href={`mailto:${personalInfo.email}`} className={linkClass}>
        {personalInfo.email}
      </a>
    ),
  ].filter(Boolean);

  const profileLinks: ReactNode[] = [
    personalInfo.github && (
      <a
        href={personalInfo.github}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        GitHub
      </a>
    ),
    personalInfo.linkedin && (
      <a
        href={personalInfo.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        LinkedIn
      </a>
    ),
  ].filter(Boolean);

  return (
    <article
      className="
        mx-auto min-h-[297mm] max-w-[210mm]
        bg-white font-resume text-[13px] leading-[1.3] text-black
        px-12 py-10 shadow-lg
        print:m-0 print:min-h-0 print:p-0 print:shadow-none
      "
    >
      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="space-y-0.5 text-center">
        <h1 className="text-[25px] font-bold uppercase leading-tight tracking-wide text-resume-accent">
          {personalInfo.name}
        </h1>

        <p className="text-[15px]">{personalInfo.title}</p>

        <DotList items={contactItems} />
        <DotList items={profileLinks} />
      </header>

      {/* ── Summary ────────────────────────────────────────────────── */}
      {data.summary && (
        <section className="mt-4">
          <SectionHeading>Summary</SectionHeading>
          <p>{data.summary}</p>
        </section>
      )}

      {/* ── Skills ─────────────────────────────────────────────────── */}
      <section className="mt-4">
        <SectionHeading>Technical Skills</SectionHeading>

        <ul>
          {Object.entries(skills).map(([key, items]) => {
            if (!items || items.length === 0) return null;
            return (
              <li key={key}>
                <span className="font-bold">
                  {skillCategoryLabels[key] ?? key}:{" "}
                </span>
                {items.join(", ")}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── Projects / Experience ──────────────────────────────────── */}
      <section className="mt-4">
        <SectionHeading>Projects</SectionHeading>

        <div className="space-y-2.5">
          {projects.map((project) => (
            <div key={project.name} className="break-inside-avoid">
              <h3 className="font-bold">
                {project.name}
                {project.role && <> — {project.role}</>}
              </h3>

              <p className="mt-0.5">{project.description}</p>

              {project.technologies.length > 0 && (
                <p className="mt-0.5 text-neutral-500">
                  <span className="font-bold">Tech:</span>{" "}
                  {project.technologies.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Education ──────────────────────────────────────────────── */}
      <section className="mt-4">
        <SectionHeading>Education</SectionHeading>

        <div className="space-y-1.5">
          {education.map((edu) => (
            <div key={edu.institution} className="break-inside-avoid">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <p className="font-bold">{edu.degree}</p>
                {edu.status && (
                  <span className="text-neutral-500">{edu.status}</span>
                )}
              </div>
              <p>{edu.institution}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Languages ──────────────────────────────────────────────── */}
      {personalInfo.languages.length > 0 && (
        <section className="mt-4">
          <SectionHeading>Languages</SectionHeading>
          <p>{personalInfo.languages.join(" · ")}</p>
        </section>
      )}
    </article>
  );
}
