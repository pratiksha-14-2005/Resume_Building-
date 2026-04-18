export function emptyEducation() {
  return { degree: '', institution: '', startDate: '', endDate: '' }
}

export function emptyExperience() {
  return {
    jobTitle: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    responsibilities: '',
  }
}

export function emptySkill() {
  return { skillName: '', proficiency: '' }
}

export function emptyCertification() {
  return {
    certificationName: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
  }
}

export function emptyProject() {
  return { name: '', description: '', link: '', techStack: '' }
}

export function emptyInternship() {
  return { company: '', role: '', duration: '', description: '' }
}

export function emptyLine() {
  return { content: '' }
}

export function resumeToForm(resume) {
  return {
    title: resume.title ?? '',
    resumeType: resume.resumeType ?? 'FRESHER',
    objective: resume.objective ?? '',
    professionalSummary: resume.professionalSummary ?? '',
    displayName: resume.displayName ?? '',
    displayEmail: resume.displayEmail ?? '',
    displayPhone: resume.displayPhone ?? '',
    displayAddress: resume.displayAddress ?? '',
    linkedInUrl: resume.linkedInUrl ?? '',
    githubUrl: resume.githubUrl ?? '',
    educations:
      resume.educations?.map((e) => ({
        degree: e.degree ?? '',
        institution: e.institution ?? '',
        startDate: e.startDate ?? '',
        endDate: e.endDate ?? '',
      })) ?? [],
    experiences:
      resume.experiences?.map((e) => ({
        jobTitle: e.jobTitle ?? '',
        company: e.company ?? '',
        location: e.location ?? '',
        startDate: e.startDate ?? '',
        endDate: e.endDate ?? '',
        responsibilities: e.responsibilities ?? '',
      })) ?? [],
    skills:
      resume.skills?.map((s) => ({
        skillName: s.skillName ?? '',
        proficiency: s.proficiency ?? '',
      })) ?? [],
    certifications:
      resume.certifications?.map((c) => ({
        certificationName: c.certificationName ?? '',
        issuingOrganization: c.issuingOrganization ?? '',
        issueDate: c.issueDate ?? '',
        expiryDate: c.expiryDate ?? '',
      })) ?? [],
    projects:
      resume.projects?.map((p) => ({
        name: p.name ?? '',
        description: p.description ?? '',
        link: p.link ?? '',
        techStack: p.techStack ?? '',
      })) ?? [],
    internships:
      resume.internships?.map((i) => ({
        company: i.company ?? '',
        role: i.role ?? '',
        duration: i.duration ?? '',
        description: i.description ?? '',
      })) ?? [],
    achievements:
      resume.achievements?.map((a) => ({
        content: a.content ?? '',
      })) ?? [],
    extracurriculars:
      resume.extracurriculars?.map((x) => ({
        content: x.content ?? '',
      })) ?? [],
  }
}

export function formToPayload(form) {
  const nullIfEmpty = (v) => (v && String(v).trim() !== '' ? String(v).trim() : null)
  return {
    title: form.title.trim(),
    resumeType: form.resumeType,
    objective: nullIfEmpty(form.objective),
    professionalSummary: nullIfEmpty(form.professionalSummary),
    displayName: form.displayName.trim(),
    displayEmail: form.displayEmail.trim(),
    displayPhone: nullIfEmpty(form.displayPhone),
    displayAddress: nullIfEmpty(form.displayAddress),
    linkedInUrl: nullIfEmpty(form.linkedInUrl),
    githubUrl: nullIfEmpty(form.githubUrl),
    educations: form.educations
      .filter((e) => e.degree.trim() && e.institution.trim())
      .map((e) => ({
        degree: e.degree.trim(),
        institution: e.institution.trim(),
        startDate: nullIfEmpty(e.startDate),
        endDate: nullIfEmpty(e.endDate),
      })),
    experiences: form.experiences
      .filter((e) => e.jobTitle.trim() && e.company.trim())
      .map((e) => ({
        jobTitle: e.jobTitle.trim(),
        company: e.company.trim(),
        location: nullIfEmpty(e.location),
        startDate: nullIfEmpty(e.startDate),
        endDate: nullIfEmpty(e.endDate),
        responsibilities: (e.responsibilities || '').trim(),
      })),
    skills: form.skills
      .filter((s) => s.skillName.trim())
      .map((s) => ({
        skillName: s.skillName.trim(),
        proficiency: nullIfEmpty(s.proficiency),
      })),
    certifications: form.certifications
      .filter((c) => c.certificationName.trim() && c.issuingOrganization.trim())
      .map((c) => ({
        certificationName: c.certificationName.trim(),
        issuingOrganization: c.issuingOrganization.trim(),
        issueDate: nullIfEmpty(c.issueDate),
        expiryDate: nullIfEmpty(c.expiryDate),
      })),
    projects: form.projects
      .filter((p) => p.name.trim() && p.description.trim())
      .map((p) => ({
        name: p.name.trim(),
        description: p.description.trim(),
        link: nullIfEmpty(p.link),
        techStack: nullIfEmpty(p.techStack),
      })),
    internships: form.internships
      .filter((i) => i.company.trim())
      .map((i) => ({
        company: i.company.trim(),
        role: nullIfEmpty(i.role),
        duration: nullIfEmpty(i.duration),
        description: nullIfEmpty(i.description),
      })),
    achievements: form.achievements
      .filter((a) => a.content.trim())
      .map((a) => ({ content: a.content.trim() })),
    extracurriculars: form.extracurriculars
      .filter((x) => x.content.trim())
      .map((x) => ({ content: x.content.trim() })),
  }
}
