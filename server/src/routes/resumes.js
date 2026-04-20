import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { createResumeSchema, resumePayloadSchema } from '../validation/resume.js'

const router = Router()

const includeAll = {
  educations: true,
  experiences: true,
  skills: true,
  certifications: true,
  projects: true,
  internships: true,
  achievements: true,
  extracurriculars: true,
}

router.use(requireAuth)

router.get('/', async (req, res) => {
  const list = await prisma.resume.findMany({
    where: { userId: req.userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      resumeType: true,
      creationDate: true,
      updatedAt: true,
      displayName: true,
    },
  })
  return res.json({ resumes: list })
})

router.post('/', async (req, res) => {
  const parsed = createResumeSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const { title, resumeType } = parsed.data
  const resume = await prisma.resume.create({
    data: {
      userId: req.userId,
      title,
      resumeType,
      designTemplate: 'classic',
      designColor: '#0f4c75',
      designFont: 'Inter, sans-serif',
      displayName: user.name,
      displayEmail: user.email,
      displayPhone: user.phone,
      displayAddress: user.address,
    },
    include: includeAll,
  })
  return res.status(201).json({ resume })
})

router.get('/:id', async (req, res) => {
  const resume = await prisma.resume.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: includeAll,
  })
  if (!resume) {
    return res.status(404).json({ error: 'Not found' })
  }
  return res.json({ resume })
})

router.put('/:id', async (req, res) => {
  const parsed = resumePayloadSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }
  const id = req.params.id
  const existing = await prisma.resume.findFirst({
    where: { id, userId: req.userId },
    select: { id: true },
  })
  if (!existing) {
    return res.status(404).json({ error: 'Not found' })
  }
  const d = parsed.data

  const resume = await prisma.$transaction(async (tx) => {
    await tx.resume.update({
      where: { id },
      data: {
        title: d.title,
        resumeType: d.resumeType,
        designTemplate: d.designTemplate ?? 'classic',
        designColor: d.designColor ?? '#0f4c75',
        designFont: d.designFont ?? 'Inter, sans-serif',
        objective: d.objective ?? null,
        professionalSummary: d.professionalSummary ?? null,
        displayName: d.displayName,
        displayEmail: d.displayEmail,
        displayPhone: d.displayPhone ?? null,
        displayAddress: d.displayAddress ?? null,
        linkedInUrl: d.linkedInUrl ?? null,
        githubUrl: d.githubUrl ?? null,
      },
    })

    await tx.education.deleteMany({ where: { resumeId: id } })
    await tx.experience.deleteMany({ where: { resumeId: id } })
    await tx.skill.deleteMany({ where: { resumeId: id } })
    await tx.certification.deleteMany({ where: { resumeId: id } })
    await tx.project.deleteMany({ where: { resumeId: id } })
    await tx.internship.deleteMany({ where: { resumeId: id } })
    await tx.achievement.deleteMany({ where: { resumeId: id } })
    await tx.extraCurricular.deleteMany({ where: { resumeId: id } })

    if (d.educations.length) {
      await tx.education.createMany({
        data: d.educations.map((e) => ({
          resumeId: id,
          degree: e.degree,
          institution: e.institution,
          startDate: e.startDate ?? null,
          endDate: e.endDate ?? null,
        })),
      })
    }
    if (d.experiences.length) {
      await tx.experience.createMany({
        data: d.experiences.map((e) => ({
          resumeId: id,
          jobTitle: e.jobTitle,
          company: e.company,
          location: e.location ?? null,
          startDate: e.startDate ?? null,
          endDate: e.endDate ?? null,
          responsibilities: e.responsibilities,
        })),
      })
    }
    if (d.skills.length) {
      await tx.skill.createMany({
        data: d.skills.map((s) => ({
          resumeId: id,
          skillName: s.skillName,
          proficiency: s.proficiency ?? null,
        })),
      })
    }
    if (d.certifications.length) {
      await tx.certification.createMany({
        data: d.certifications.map((c) => ({
          resumeId: id,
          certificationName: c.certificationName,
          issuingOrganization: c.issuingOrganization,
          issueDate: c.issueDate ?? null,
          expiryDate: c.expiryDate ?? null,
        })),
      })
    }
    if (d.projects.length) {
      await tx.project.createMany({
        data: d.projects.map((p) => ({
          resumeId: id,
          name: p.name,
          description: p.description,
          link: p.link ?? null,
          techStack: p.techStack ?? null,
        })),
      })
    }
    if (d.internships.length) {
      await tx.internship.createMany({
        data: d.internships.map((i) => ({
          resumeId: id,
          company: i.company,
          role: i.role ?? null,
          duration: i.duration ?? null,
          description: i.description ?? null,
        })),
      })
    }
    if (d.achievements.length) {
      await tx.achievement.createMany({
        data: d.achievements.map((a) => ({
          resumeId: id,
          content: a.content,
        })),
      })
    }
    if (d.extracurriculars.length) {
      await tx.extraCurricular.createMany({
        data: d.extracurriculars.map((x) => ({
          resumeId: id,
          content: x.content,
        })),
      })
    }

    return tx.resume.findUnique({
      where: { id },
      include: includeAll,
    })
  })

  return res.json({ resume })
})

router.delete('/:id', async (req, res) => {
  const id = req.params.id
  const result = await prisma.resume.deleteMany({
    where: { id, userId: req.userId },
  })
  if (result.count === 0) {
    return res.status(404).json({ error: 'Not found' })
  }
  return res.json({ ok: true })
})

export default router
