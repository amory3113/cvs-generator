import type { Resume } from "@/src/lib/schema";

// Human-readable labels for the snake_case skill category keys.
const skillCategoryLabels: Record<string, string> = {
  mobile: "Mobile",
  web_and_backend: "Web & Backend",
  infrastructure_and_qa: "Infrastructure & QA",
  ai_and_automation: "AI & Automation",
  tools: "Tools",
};

interface ResumePreviewProps {
  data: Resume;
}

export default function ResumePreview({ data }: ResumePreviewProps) {
  const { personalInfo, education, skills, projects } = data;

  return (
    <article
      className="
        mx-auto max-w-[210mm] min-h-[297mm]
        bg-white text-black font-sans
        px-10 py-8 shadow-lg
        print:shadow-none print:p-0 print:m-0
      "
    >
      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="mb-5 border-b border-neutral-300 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          {personalInfo.name}
        </h1>

        <p className="mt-0.5 text-base font-medium text-neutral-700">
          {personalInfo.title}
        </p>

        <p className="mt-1.5 text-sm text-neutral-600">
          {[personalInfo.phone, personalInfo.email, personalInfo.location]
            .filter(Boolean)
            .join(" • ")}
        </p>

        {personalInfo.languages.length > 0 && (
          <p className="mt-1 text-sm text-neutral-600">
            <span className="font-semibold">Languages: </span>
            {personalInfo.languages.join(", ")}
          </p>
        )}
      </header>

      {/* ── Skills ─────────────────────────────────────────────────── */}
      <section className="mb-5">
        <h2 className="mb-2 text-lg font-bold uppercase tracking-wide border-b border-neutral-200 pb-1">
          Skills
        </h2>

        <ul className="space-y-1 text-sm">
          {Object.entries(skills).map(([key, items]) => {
            if (!items || items.length === 0) return null;
            return (
              <li key={key}>
                <span className="font-semibold">
                  {skillCategoryLabels[key] ?? key}:{" "}
                </span>
                {items.join(", ")}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── Projects / Experience ──────────────────────────────────── */}
      <section className="mb-5">
        <h2 className="mb-2 text-lg font-bold uppercase tracking-wide border-b border-neutral-200 pb-1">
          Projects
        </h2>

        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.name}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 className="text-base font-bold">{project.name}</h3>
                <span className="text-sm text-neutral-600">
                  {project.role}
                </span>
              </div>

              {project.technologies.length > 0 && (
                <p className="mt-0.5 text-sm italic text-neutral-500">
                  {project.technologies.join(", ")}
                </p>
              )}

              <p className="mt-1 text-sm leading-relaxed">
                {project.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Education ──────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-2 text-lg font-bold uppercase tracking-wide border-b border-neutral-200 pb-1">
          Education
        </h2>

        <div className="space-y-2">
          {education.map((edu) => (
            <div key={edu.institution}>
              <p className="text-sm font-bold">{edu.institution}</p>
              <p className="text-sm">
                {edu.degree}
                {edu.status && (
                  <span className="ml-2 text-neutral-500">
                    — {edu.status}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
