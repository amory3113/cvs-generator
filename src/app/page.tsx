"use client";

import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { generateTailoredResume } from "@/src/actions/generateResume";
import ResumePreview from "@/src/components/resume/ResumePreview";
import type { Resume } from "@/src/lib/schema";

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeData, setResumeData] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resumeRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: resumeData
      ? `${resumeData.personalInfo.name} - Resume`
      : "Resume",
  });

  async function handleGenerate() {
    if (!jobDescription.trim()) {
      setError("Please paste a job description before generating.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateTailoredResume(jobDescription);
      setResumeData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <header className="border-b border-neutral-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight">
          ATS Resume Generator
        </h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          Paste a job description, generate a tailored resume, and download it
          as a PDF.
        </p>
      </header>

      {/* ── Main two-column layout ───────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-8 lg:grid lg:grid-cols-2 lg:gap-8">
        {/* ── Left: Controls ─────────────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="job-description"
              className="text-sm font-semibold"
            >
              Job Description
            </label>
            <textarea
              id="job-description"
              rows={14}
              placeholder="Paste the full job description here…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full resize-y rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200 transition"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Generating…
                </>
              ) : (
                "Generate Tailored Resume"
              )}
            </button>

            {resumeData && (
              <button
                onClick={() => handlePrint()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
              >
                Download PDF
              </button>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        {/* ── Right: Preview ─────────────────────────────────────── */}
        <section className="mt-8 lg:mt-0">
          {resumeData ? (
            <div ref={resumeRef}>
              <ResumePreview data={resumeData} />
            </div>
          ) : (
            <div className="flex min-h-[297mm] items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-white text-neutral-400">
              <p className="max-w-xs text-center text-sm leading-relaxed">
                Paste a job description and click{" "}
                <span className="font-semibold text-neutral-500">Generate</span>{" "}
                to see the tailored resume preview here.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
