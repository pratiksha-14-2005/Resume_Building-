import "dotenv/config";
import { defineConfig } from "prisma/config"; // Ensure this matches your installed version

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: "postgresql://postgres:pratuuu16@localhost:5432/resume_db?schema=public",
  },
});