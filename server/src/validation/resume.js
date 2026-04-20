import { z } from 'zod'

const resumeType = z.enum(['FRESHER', 'EXPERIENCED'])

const education = z.object({
  degree: z.string().trim().min(1).max(200),
  institution: z.string().trim().min(1).max(200),
  startDate: z.string().trim().max(40).optional().nullable(),
  endDate: z.string().trim().max(40).optional().nullable(),
})

const experience = z.object({
  jobTitle: z.string().trim().min(1).max(200),
  company: z.string().trim().min(1).max(200),
  location: z.string().trim().max(200).optional().nullable(),
  startDate: z.string().trim().max(40).optional().nullable(),
  endDate: z.string().trim().max(40).optional().nullable(),
  responsibilities: z.string().trim().max(8000).optional().default(''),
})

const skill = z.object({
  skillName: z.string().trim().min(1).max(120),
  proficiency: z.string().trim().max(80).optional().nullable(),
})

const certification = z.object({
  certificationName: z.string().trim().min(1).max(200),
  issuingOrganization: z.string().trim().min(1).max(200),
  issueDate: z.string().trim().max(40).optional().nullable(),
  expiryDate: z.string().trim().max(40).optional().nullable(),
})

const project = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000),
  link: z.string().trim().max(500).optional().nullable(),
  techStack: z.string().trim().max(500).optional().nullable(),
})

const internship = z.object({
  company: z.string().trim().min(1).max(200),
  role: z.string().trim().max(200).optional().nullable(),
  duration: z.string().trim().max(120).optional().nullable(),
  description: z.string().trim().max(4000).optional().nullable(),
})

const lineItem = z.object({
  content: z.string().trim().min(1).max(2000),
})

export const resumePayloadSchema = z.object({
  title: z.string().trim().min(1).max(200),
  resumeType: resumeType,
  designTemplate: z.string().trim().max(40).optional().nullable(),
  designColor: z.string().trim().max(30).optional().nullable(),
  designFont: z.string().trim().max(80).optional().nullable(),
  objective: z.string().trim().max(4000).optional().nullable(),
  professionalSummary: z.string().trim().max(4000).optional().nullable(),
  displayName: z.string().trim().min(1).max(200),
  displayEmail: z.string().trim().email().max(255),
  displayPhone: z.string().trim().max(40).optional().nullable(),
  displayAddress: z.string().trim().max(500).optional().nullable(),
  linkedInUrl: z.string().trim().max(500).optional().nullable(),
  githubUrl: z.string().trim().max(500).optional().nullable(),
  educations: z.array(education).max(20),
  experiences: z.array(experience).max(30),
  skills: z.array(skill).max(80),
  certifications: z.array(certification).max(40),
  projects: z.array(project).max(30),
  internships: z.array(internship).max(20),
  achievements: z.array(lineItem).max(40),
  extracurriculars: z.array(lineItem).max(40),
})

export const createResumeSchema = z.object({
  title: z.string().trim().min(1).max(200),
  resumeType: resumeType,
})
