import React from 'react'
import { Document, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

function mapPdfFont(font) {
  if (!font) return 'Helvetica'
  if (font.includes('Georgia')) return 'Times-Roman'
  if (font.includes('Gill')) return 'Helvetica'
  if (font.includes('Trebuchet')) return 'Helvetica'
  return 'Helvetica'
}

function createStyles(resume) {
  const accent = resume.designColor || '#0f4c75'
  const fontFamily = mapPdfFont(resume.designFont)
  const template = resume.designTemplate || 'classic'
  const isSplit = template === 'classic'

  return StyleSheet.create({
    page: {
      paddingTop: 36,
      paddingBottom: 40,
      paddingHorizontal: 40,
      fontSize: 9.5,
      fontFamily,
      color: '#111',
    },
    shell: isSplit
      ? {
          flexDirection: 'row',
          gap: 16,
        }
      : {
          flexDirection: 'column',
        },
    side: isSplit
      ? {
          width: '26%',
          backgroundColor: accent,
          borderRadius: 10,
          padding: 14,
        }
      : {
          width: '100%',
        },
    main: isSplit
      ? {
          width: '74%',
        }
      : {
          width: '100%',
        },
    sideName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#fff', marginBottom: 4 },
    sideRole: { fontSize: 9, color: '#e5eefb', marginBottom: 12 },
    sideLabel: {
      fontSize: 9,
      color: '#fff',
      fontFamily: 'Helvetica-Bold',
      marginTop: 10,
      marginBottom: 4,
    },
    sideText: { fontSize: 8.4, color: '#eff6ff', marginBottom: 3 },
    name: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginBottom: 4, color: accent },
    contact: { fontSize: 9, color: '#333', marginBottom: 12 },
    link: { color: accent, textDecoration: 'none' },
    sectionTitle: {
      fontSize: 11,
      fontFamily: 'Helvetica-Bold',
      marginTop: 10,
      marginBottom: 4,
      borderBottomWidth: 0.5,
      borderBottomColor: accent,
      paddingBottom: 2,
      color: accent,
    },
    block: { marginBottom: 6 },
    bold: { fontFamily: 'Helvetica-Bold' },
    muted: { color: '#444' },
    bullet: { marginLeft: 8, marginTop: 2 },
  })
}

function ContactLine({ resume, styles }) {
  const parts = [resume.displayEmail, resume.displayPhone, resume.displayAddress].filter(Boolean)
  return (
    <View>
      {parts.length > 0 ? <Text style={styles.contact}>{parts.join(' / ')}</Text> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
        {resume.linkedInUrl ? (
          <Link wrap={false} src={resume.linkedInUrl} style={[styles.link, { marginRight: 14 }]}>
            <Text>LinkedIn</Text>
          </Link>
        ) : null}
        {resume.githubUrl ? (
          <Link wrap={false} src={resume.githubUrl} style={styles.link}>
            <Text>GitHub</Text>
          </Link>
        ) : null}
      </View>
    </View>
  )
}

function MainSections({ resume, styles }) {
  const isFresher = resume.resumeType === 'FRESHER'

  return (
    <>
      {isFresher && resume.objective ? (
        <View wrap={false}>
          <Text style={styles.sectionTitle}>Career objective</Text>
          <Text style={styles.block}>{resume.objective}</Text>
        </View>
      ) : null}
      {!isFresher && resume.professionalSummary ? (
        <View wrap={false}>
          <Text style={styles.sectionTitle}>Professional summary</Text>
          <Text style={styles.block}>{resume.professionalSummary}</Text>
        </View>
      ) : null}

      {resume.educations?.length ? (
        <View>
          <Text style={styles.sectionTitle}>Education</Text>
          {resume.educations.map((e) => (
            <View key={e.id} style={styles.block} wrap={false}>
              <Text>
                <Text style={styles.bold}>{e.degree}</Text>
                {e.institution ? ` - ${e.institution}` : ''}
              </Text>
              <Text style={styles.muted}>{[e.startDate, e.endDate].filter(Boolean).join(' to ')}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {resume.experiences?.length ? (
        <View>
          <Text style={styles.sectionTitle}>Experience</Text>
          {resume.experiences.map((x) => (
            <View key={x.id} style={styles.block} wrap={false}>
              <Text>
                <Text style={styles.bold}>{x.jobTitle}</Text>
                {x.company ? ` / ${x.company}` : ''}
                {x.location ? ` / ${x.location}` : ''}
              </Text>
              <Text style={styles.muted}>{[x.startDate, x.endDate].filter(Boolean).join(' to ')}</Text>
              {x.responsibilities ? <Text style={{ marginTop: 2 }}>{x.responsibilities}</Text> : null}
            </View>
          ))}
        </View>
      ) : null}

      {resume.projects?.length ? (
        <View>
          <Text style={styles.sectionTitle}>Projects</Text>
          {resume.projects.map((p) => (
            <View key={p.id} style={styles.block} wrap={false}>
              <Text style={styles.bold}>{p.name}</Text>
              {p.techStack ? <Text style={styles.muted}>{p.techStack}</Text> : null}
              <Text>{p.description}</Text>
              {p.link ? (
                <Link src={p.link} style={styles.link}>
                  <Text>Project link</Text>
                </Link>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {resume.certifications?.length ? (
        <View>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {resume.certifications.map((c) => (
            <View key={c.id} style={styles.block} wrap={false}>
              <Text style={styles.bold}>{c.certificationName}</Text>
              <Text style={styles.muted}>{c.issuingOrganization}</Text>
              <Text style={styles.muted}>{[c.issueDate, c.expiryDate].filter(Boolean).join(' to ')}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {resume.internships?.length ? (
        <View>
          <Text style={styles.sectionTitle}>Internships / training</Text>
          {resume.internships.map((i) => (
            <View key={i.id} style={styles.block} wrap={false}>
              <Text style={styles.bold}>{i.company}</Text>
              <Text style={styles.muted}>{[i.role, i.duration].filter(Boolean).join(' / ')}</Text>
              {i.description ? <Text>{i.description}</Text> : null}
            </View>
          ))}
        </View>
      ) : null}

      {resume.achievements?.length ? (
        <View>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {resume.achievements.map((a) => (
            <Text key={a.id} style={styles.bullet}>
              - {a.content}
            </Text>
          ))}
        </View>
      ) : null}

      {resume.extracurriculars?.length ? (
        <View>
          <Text style={styles.sectionTitle}>Extra-curricular</Text>
          {resume.extracurriculars.map((x) => (
            <Text key={x.id} style={styles.bullet}>
              - {x.content}
            </Text>
          ))}
        </View>
      ) : null}
    </>
  )
}

export function ResumePdfDocument({ resume }) {
  const styles = createStyles(resume)
  const isSplit = (resume.designTemplate || 'classic') === 'classic'

  return (
    <Document title={resume.title || 'Resume'}>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.shell}>
          {isSplit ? (
            <View style={styles.side}>
              <Text style={styles.sideName}>{resume.displayName || 'Your name'}</Text>
              <Text style={styles.sideRole}>{resume.title || 'Resume'}</Text>

              <Text style={styles.sideLabel}>Contact</Text>
              {[resume.displayEmail, resume.displayPhone, resume.displayAddress].filter(Boolean).map((item) => (
                <Text key={item} style={styles.sideText}>
                  {item}
                </Text>
              ))}

              {resume.skills?.length ? (
                <>
                  <Text style={styles.sideLabel}>Skills</Text>
                  {resume.skills.map((s) => (
                    <Text key={s.id} style={styles.sideText}>
                      {s.proficiency ? `${s.skillName} (${s.proficiency})` : s.skillName}
                    </Text>
                  ))}
                </>
              ) : null}
            </View>
          ) : null}

          <View style={styles.main}>
            {!isSplit ? (
              <>
                <Text style={styles.name}>{resume.displayName || 'Your name'}</Text>
                <ContactLine resume={resume} styles={styles} />
              </>
            ) : null}
            {isSplit ? (
              <>
                <Text style={styles.name}>{resume.displayName || 'Your name'}</Text>
                <ContactLine resume={resume} styles={styles} />
              </>
            ) : null}

            <MainSections resume={resume} styles={styles} />
          </View>
        </View>
      </Page>
    </Document>
  )
}
