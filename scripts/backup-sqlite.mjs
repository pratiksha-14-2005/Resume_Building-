import fs from 'fs/promises'
import path from 'path'

const rootDir = process.cwd()
const sourcePath = path.join(rootDir, 'server', 'prisma', 'dev.db')
const backupDir = path.join(rootDir, 'backups')
const retention = Number(process.env.BACKUP_RETENTION ?? 14)

function stamp(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}-${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}`
}

async function ensureSourceExists() {
  try {
    await fs.access(sourcePath)
  } catch {
    throw new Error(`SQLite database not found at ${sourcePath}`)
  }
}

async function pruneOldBackups() {
  const files = await fs.readdir(backupDir)
  const dbBackups = files
    .filter((f) => /^dev-\d{8}-\d{6}\.db$/.test(f))
    .sort((a, b) => b.localeCompare(a))

  const stale = dbBackups.slice(Math.max(retention, 0))
  await Promise.all(stale.map((f) => fs.unlink(path.join(backupDir, f))))
  return stale.length
}

async function main() {
  await ensureSourceExists()
  await fs.mkdir(backupDir, { recursive: true })

  const filename = `dev-${stamp()}.db`
  const outputPath = path.join(backupDir, filename)
  await fs.copyFile(sourcePath, outputPath)
  const prunedCount = await pruneOldBackups()

  console.log(`Backup created: ${outputPath}`)
  console.log(`Retention: keeping latest ${retention} backup(s), pruned ${prunedCount}.`)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
