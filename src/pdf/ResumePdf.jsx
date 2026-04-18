import React from 'react'
import { Document, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: '#111',
  },
  name: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  contact: { fontSize: 9, color: '#333', marginBottom: 12 },
  link: { color: '#1a0dab', textDecoration: 'none' },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginTop: 10,
    marginBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#999',
    paddingBottom: 2,
  },
  block: { marginBottom: 6 },
  bold: { fontFamily: 'Helvetica-Bold' },
  muted: { color: '#444' },
  bullet: { marginLeft: 8, marginTop: 2 },
})

function ContactLine({ resume }) {
  const parts = [
    resume.displayEmail,
    resume.displayPhone,
    resume.displayAddress,
  ].filter(Boolean)
  return (
    <View>
      {parts.length > 0 ? <Text style={styles.contact}>{parts.join(' · ')}</Text> : null}
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

export function ResumePdfDocument({ resume }) {
  const isFresher = resume.resumeType === 'FRESHER'

  return (
    <Document title={resume.title || 'Resume'}>
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.name}>{resume.displayName || 'Your name'}</Text>
        <ContactLine resume={resume} />

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
                  {e.institution ? ` — ${e.institution}` : ''}
                </Text>
                <Text style={styles.muted}>
                  {[e.startDate, e.endDate].filter(Boolean).join(' – ')}
                </Text>
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
                  {x.company ? ` · ${x.company}` : ''}
                  {x.location ? ` · ${x.location}` : ''}
                </Text>
                <Text style={styles.muted}>
                  {[x.startDate, x.endDate].filter(Boolean).join(' – ')}
                </Text>
                {x.responsibilities ? (
                  <Text style={{ marginTop: 2 }}>{x.responsibilities}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {resume.skills?.length ? (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.block}>
              {resume.skills
                .map((s) => (s.proficiency ? `${s.skillName} (${s.proficiency})` : s.skillName))
                .join(' · ')}
            </Text>
          </View>
        ) : null}

        {resume.certifications?.length ? (
          <View>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {resume.certifications.map((c) => (
              <View key={c.id} style={styles.block} wrap={false}>
                <Text style={styles.bold}>{c.certificationName}</Text>
                <Text style={styles.muted}>{c.issuingOrganization}</Text>
                <Text style={styles.muted}>
                  {[c.issueDate, c.expiryDate].filter(Boolean).join(' → ')}
                </Text>
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

        {resume.internships?.length ? (
          <View>
            <Text style={styles.sectionTitle}>Internships / training</Text>
            {resume.internships.map((i) => (
              <View key={i.id} style={styles.block} wrap={false}>
                <Text style={styles.bold}>{i.company}</Text>
                <Text style={styles.muted}>
                  {[i.role, i.duration].filter(Boolean).join(' · ')}
                </Text>
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
                • {a.content}
              </Text>
            ))}
          </View>
        ) : null}

        {resume.extracurriculars?.length ? (
          <View>
            <Text style={styles.sectionTitle}>Extra-curricular</Text>
            {resume.extracurriculars.map((x) => (
              <Text key={x.id} style={styles.bullet}>
                • {x.content}
              </Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  )
}
