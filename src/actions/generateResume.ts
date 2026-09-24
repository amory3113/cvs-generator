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
        github: { type: "string" },
        linkedin: { type: "string" },
        languages: { type: "array", items: { type: "string" } },
      },
      required: [
        "name",
        "title",
        "phone",
        "email",
        "location",
        "github",
        "linkedin",
        "languages",
      ],
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
    summary: { type: "string" },
  },
  required: ["personalInfo", "summary", "education", "skills", "projects"],
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

  // --- 2. Read both API keys ---
  const freeKey = process.env.GEMINI_FREE_API_KEY;
  const paidKey = process.env.GEMINI_PAID_API_KEY;
  if (!freeKey || !paidKey) {
    throw new Error(
      "Missing GEMINI_FREE_API_KEY or GEMINI_PAID_API_KEY environment variable. Add both to .env.local.",
    );
  }

  // --- 3. Build the prompt ---
  const prompt = `You are an expert, ruthless ATS (Applicant Tracking System) resume optimizer.

You will receive two inputs:
1. A MASTER RESUME in JSON format — this is the single source of truth.
2. A JOB DESCRIPTION — this is the target role to tailor the resume for.

Your task:
- FILTER AGGRESSIVELY. If a skill, technology, or project does not directly support the requirements of the job description, REMOVE IT completely.
- BE RUTHLESS with skill categories. If a category (e.g., "mobile", "infrastructure_and_qa") is completely irrelevant to the job (e.g., Android skills for a Web/QA job), return an EMPTY ARRAY [] for that category.
- STRICT LIMIT: Select a MAXIMUM of 3 most relevant projects. Drop all other projects. 
- REWRITE the descriptions of the kept projects to heavily emphasize the keywords, skills, and responsibilities mentioned in the job description (e.g., focus on TypeScript, testing, UI elements, automation if the job requires it). Do NOT invent facts, but shift the focus.
- REWRITE the "summary" to create a compelling 2-3 sentence professional summary that perfectly aligns the candidate's background with the specific job description.
- Update the "title" field inside "personalInfo" to EXACTLY match the job title from the job description.
- Keep ALL "personalInfo" fields (name, phone, email, location, languages) unchanged.
- Keep the "education" entries unchanged.

CRITICAL RULES:
- ZERO HALLUCINATIONS: You MUST NOT invent or add any skills, technologies, projects, or experience that are not present in the master resume.
- Only SELECT FROM and REWRITE the existing data.
- Every skill you include must exist verbatim in the master resume.

=== MASTER RESUME (JSON) ===
${masterResumeRaw}

=== JOB DESCRIPTION ===
${jobDescription}

Return ONLY the tailored resume as a JSON object matching the provided schema. Do not return empty categories if they can be omitted, but strictly follow the JSON schema structure.`;

  // --- 4. Call Gemini with free-tier → paid-tier fallback ---
  const requestConfig = {
    model: "gemini-3.8-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json" as const,
      responseSchema: resumeJsonSchema,
    },
  };

  let rawText: string | undefined;

  try {
    const freeAi = new GoogleGenAI({ apiKey: freeKey });
    const response = await freeAi.models.generateContent(requestConfig);
    rawText = response.text;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();

    const isHighDemand =
      message.includes("503") ||
      message.includes("high demand") ||
      message.includes("unavailable");

    if (!isHighDemand) {
      throw err;
    }

    // Retry with the paid key
    console.warn("[generateTailoredResume] Free tier unavailable (503). Falling back to paid key.");
    const paidAi = new GoogleGenAI({ apiKey: paidKey });
    const response = await paidAi.models.generateContent(requestConfig);
    rawText = response.text;
  }

  if (!rawText) {
    throw new Error("Gemini returned an empty response.");
  }

  // --- 5. Parse & validate against our Zod schema for type safety ---
  const tailoredResume: Resume = resumeSchema.parse(JSON.parse(rawText));

  return tailoredResume;
}
