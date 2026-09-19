import { z } from "zod";

// --- Sub-schemas ---

const personalInfoSchema = z.object({
  name: z.string(),
  title: z.string(),
  phone: z.string(),
  email: z.string().email(),
  location: z.string(),
  languages: z.array(z.string()),
});

const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  status: z.string(),
});

const skillsSchema = z.object({
  mobile: z.array(z.string()),
  web_and_backend: z.array(z.string()),
  infrastructure_and_qa: z.array(z.string()),
  ai_and_automation: z.array(z.string()),
  tools: z.array(z.string()),
});

const projectSchema = z.object({
  name: z.string(),
  role: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
});

// --- Root schema ---

export const resumeSchema = z.object({
  personalInfo: personalInfoSchema,
  education: z.array(educationSchema),
  skills: skillsSchema,
  projects: z.array(projectSchema),
});

// --- Inferred types ---

export type Resume = z.infer<typeof resumeSchema>;
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type Education = z.infer<typeof educationSchema>;
export type SkillCategory = z.infer<typeof skillsSchema>;
export type Project = z.infer<typeof projectSchema>;
