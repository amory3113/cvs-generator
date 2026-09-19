"use server";

import fs from "fs/promises";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { resumeSchema, type Resume } from "@/src/lib/schema";

// JSON Schema representation of the resume structure, used to constrain
// the Gemini response format so the model returns strictly valid JSON.
const resumeJsonSchema = {
  type: "object",
  properties: {
    personalInfo: {
      type: "object",
      properties: {
        name: { type: "string" },
        title: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        location: { type: "string" },
        languages: { type: "array", items: { type: "string" } },
      },
      required: ["name", "title", "phone", "email", "location", "languages"],
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          institution: { type: "string" },
          degree: { type: "string" },
          status: { type: "string" },
        },
        required: ["institution", "degree", "status"],
      },
    },
    skills: {
      type: "object",
      properties: {
        mobile: { type: "array", items: { type: "string" } },
        web_and_backend: { type: "array", items: { type: "string" } },
        infrastructure_and_qa: { type: "array", items: { type: "string" } },
        ai_and_automation: { type: "array", items: { type: "string" } },
        tools: { type: "array", items: { type: "string" } },
      },
      required: [
        "mobile",
        "web_and_backend",
        "infrastructure_and_qa",
        "ai_and_automation",
        "tools",
      ],
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          role: { type: "string" },
          description: { type: "string" },
          technologies: { type: "array", items: { type: "string" } },
        },
        required: ["name", "role", "description", "technologies"],
      },
    },
  },
  required: ["personalInfo", "education", "skills", "projects"],
} as const;

export async function generateTailoredResume(
  jobDescription: string,
): Promise<Resume> {
  // --- 1. Load the master resume from disk ---
  const masterResumePath = path.join(
    process.cwd(),
    "src",
    "data",
    "master-resume.json",
  );
  const masterResumeRaw = await fs.readFile(masterResumePath, "utf-8");

  // --- 2. Initialise the Gemini client ---
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing GEMINI_API_KEY environment variable. Add it to .env.local.",
    );
  }
  const ai = new GoogleGenAI({ apiKey });

  // --- 3. Build the prompt ---
  const prompt = `You are an expert ATS (Applicant Tracking System) resume optimizer.

You will receive two inputs:
1. A MASTER RESUME in JSON format — this is the single source of truth.
2. A JOB DESCRIPTION — this is the target role to tailor the resume for.

Your task:
- Filter and re-prioritize the skills, projects, and education entries so they best match the job description.
- Within each skill category, keep only the skills that are relevant to the job and order them by relevance (most relevant first).
- Select and reorder the projects so the most relevant ones appear first. Remove projects that add no value for this specific role.
- Rewrite each kept project's description to emphasize the aspects most relevant to the job description, but do NOT invent or fabricate any details.
- Update the "title" field inside "personalInfo" to match the job title from the job description.
- Keep ALL "personalInfo" fields (name, phone, email, location, languages) unchanged — copy them exactly.
- Keep the "education" entries unchanged — copy them exactly.

CRITICAL RULES:
- You MUST NOT hallucinate, invent, or add any skills, technologies, projects, or experience that are not present in the master resume.
- You may only SELECT FROM and REORDER the existing data. You may rephrase project descriptions for emphasis, but every claim must be grounded in the original text.
- Every skill you include must exist verbatim in the master resume.
- Every project you include must exist in the master resume (same name).

=== MASTER RESUME (JSON) ===
${masterResumeRaw}

=== JOB DESCRIPTION ===
${jobDescription}

Return ONLY the tailored resume as a JSON object matching the provided schema.`;

  // --- 4. Call Gemini with structured JSON output ---
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: resumeJsonSchema,
    }
  });

  const rawText = response.text;
  if (!rawText) {
    throw new Error("Gemini returned an empty response.");
  }

  // --- 5. Parse & validate against our Zod schema for type safety ---
  const tailoredResume: Resume = resumeSchema.parse(JSON.parse(rawText));

  return tailoredResume;
}
