-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "resumeType" TEXT NOT NULL,
    "objective" TEXT,
    "professionalSummary" TEXT,
    "displayName" TEXT,
    "displayEmail" TEXT,
    "displayPhone" TEXT,
    "displayAddress" TEXT,
    "linkedInUrl" TEXT,
    "githubUrl" TEXT,
    "creationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "startDate" TEXT,
    "endDate" TEXT,
    CONSTRAINT "Education_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "responsibilities" TEXT NOT NULL,
    CONSTRAINT "Experience_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "proficiency" TEXT,
    CONSTRAINT "Skill_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "certificationName" TEXT NOT NULL,
    "issuingOrganization" TEXT NOT NULL,
    "issueDate" TEXT,
    "expiryDate" TEXT,
    CONSTRAINT "Certification_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "link" TEXT,
    "techStack" TEXT,
    CONSTRAINT "Project_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Internship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT,
    "duration" TEXT,
    "description" TEXT,
    CONSTRAINT "Internship_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    CONSTRAINT "Achievement_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExtraCurricular" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    CONSTRAINT "ExtraCurricular_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
