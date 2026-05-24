import { db } from "./client"
import { files, folders } from "./schema"

// ─── Seed data structure ──────────────────────────────────────────────────────
// Simulates a realistic Windows-style file system with:
// - 6 top-level folders
// - ~50 folders total across 5 levels of nesting
// - ~120 files with realistic names and MIME types

interface SeedFolder {
  name: string
  children?: SeedFolder[]
  files?: SeedFile[]
}

interface SeedFile {
  name: string
  size: number
  mimeType: string
}

const MB = 1024 * 1024
const KB = 1024

const SEED_TREE: SeedFolder[] = [
  {
    name: "Documents",
    files: [
      { name: "README.txt", size: 2 * KB, mimeType: "text/plain" },
      { name: "License.pdf", size: 120 * KB, mimeType: "application/pdf" },
    ],
    children: [
      {
        name: "Work",
        children: [
          {
            name: "Projects",
            files: [
              { name: "project-plan.docx", size: 45 * KB, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
              { name: "timeline.xlsx", size: 30 * KB, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
            ],
            children: [
              {
                name: "Alpha",
                files: [
                  { name: "design.fig", size: 2 * MB, mimeType: "application/figma" },
                  { name: "requirements.pdf", size: 180 * KB, mimeType: "application/pdf" },
                  { name: "wireframes.png", size: 900 * KB, mimeType: "image/png" },
                ],
              },
              {
                name: "Beta",
                files: [
                  { name: "spec.md", size: 8 * KB, mimeType: "text/markdown" },
                  { name: "api-docs.json", size: 22 * KB, mimeType: "application/json" },
                ],
                children: [
                  {
                    name: "Assets",
                    files: [
                      { name: "logo.svg", size: 5 * KB, mimeType: "image/svg+xml" },
                      { name: "banner.jpg", size: 1.2 * MB, mimeType: "image/jpeg" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: "Reports",
            files: [
              { name: "Q1-2025.pdf", size: 340 * KB, mimeType: "application/pdf" },
              { name: "Q2-2025.pdf", size: 290 * KB, mimeType: "application/pdf" },
              { name: "Q3-2025.pdf", size: 310 * KB, mimeType: "application/pdf" },
              { name: "Q4-2025.pdf", size: 405 * KB, mimeType: "application/pdf" },
            ],
          },
          {
            name: "Contracts",
            files: [
              { name: "vendor-agreement.pdf", size: 220 * KB, mimeType: "application/pdf" },
              { name: "nda-template.docx", size: 55 * KB, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
            ],
          },
        ],
      },
      {
        name: "Personal",
        children: [
          {
            name: "Finance",
            files: [
              { name: "budget-2025.xlsx", size: 40 * KB, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
              { name: "tax-return.pdf", size: 180 * KB, mimeType: "application/pdf" },
              { name: "receipts.zip", size: 5 * MB, mimeType: "application/zip" },
            ],
          },
          {
            name: "Travel",
            files: [
              { name: "passport-scan.pdf", size: 800 * KB, mimeType: "application/pdf" },
              { name: "bali-itinerary.docx", size: 25 * KB, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
            ],
            children: [
              {
                name: "Photos",
                files: [
                  { name: "beach-sunset.jpg", size: 3.2 * MB, mimeType: "image/jpeg" },
                  { name: "temple-visit.jpg", size: 2.8 * MB, mimeType: "image/jpeg" },
                  { name: "rice-fields.jpg", size: 4.1 * MB, mimeType: "image/jpeg" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Pictures",
    files: [
      { name: "profile.jpg", size: 512 * KB, mimeType: "image/jpeg" },
    ],
    children: [
      {
        name: "Screenshots",
        files: [
          { name: "screenshot-001.png", size: 800 * KB, mimeType: "image/png" },
          { name: "screenshot-002.png", size: 720 * KB, mimeType: "image/png" },
          { name: "screenshot-003.png", size: 950 * KB, mimeType: "image/png" },
        ],
      },
      {
        name: "Wallpapers",
        files: [
          { name: "mountains.jpg", size: 8 * MB, mimeType: "image/jpeg" },
          { name: "abstract-dark.jpg", size: 5 * MB, mimeType: "image/jpeg" },
          { name: "minimal-1.png", size: 2 * MB, mimeType: "image/png" },
        ],
      },
      {
        name: "Camera Roll",
        children: [
          {
            name: "2024",
            files: [
              { name: "IMG_1001.jpg", size: 4 * MB, mimeType: "image/jpeg" },
              { name: "IMG_1002.jpg", size: 3.5 * MB, mimeType: "image/jpeg" },
              { name: "IMG_1003.heic", size: 2 * MB, mimeType: "image/heic" },
            ],
          },
          {
            name: "2025",
            files: [
              { name: "IMG_2001.jpg", size: 3.8 * MB, mimeType: "image/jpeg" },
              { name: "IMG_2002.jpg", size: 4.2 * MB, mimeType: "image/jpeg" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Music",
    files: [
      { name: "playlist.m3u", size: 3 * KB, mimeType: "audio/x-mpegurl" },
    ],
    children: [
      {
        name: "Albums",
        children: [
          {
            name: "Indie Collection",
            files: [
              { name: "track-01.mp3", size: 8 * MB, mimeType: "audio/mpeg" },
              { name: "track-02.mp3", size: 7.5 * MB, mimeType: "audio/mpeg" },
              { name: "track-03.mp3", size: 9 * MB, mimeType: "audio/mpeg" },
              { name: "cover.jpg", size: 500 * KB, mimeType: "image/jpeg" },
            ],
          },
          {
            name: "Jazz Essentials",
            files: [
              { name: "blue-in-green.flac", size: 35 * MB, mimeType: "audio/flac" },
              { name: "so-what.flac", size: 42 * MB, mimeType: "audio/flac" },
            ],
          },
        ],
      },
      {
        name: "Podcasts",
        files: [
          { name: "dev-talk-ep1.mp3", size: 55 * MB, mimeType: "audio/mpeg" },
          { name: "dev-talk-ep2.mp3", size: 48 * MB, mimeType: "audio/mpeg" },
          { name: "tech-brief-ep12.mp3", size: 30 * MB, mimeType: "audio/mpeg" },
        ],
      },
    ],
  },
  {
    name: "Videos",
    children: [
      {
        name: "Movies",
        files: [
          { name: "sample-720p.mp4", size: 700 * MB, mimeType: "video/mp4" },
        ],
      },
      {
        name: "Tutorials",
        files: [
          { name: "vue3-intro.mp4", size: 200 * MB, mimeType: "video/mp4" },
          { name: "typescript-deep-dive.mp4", size: 350 * MB, mimeType: "video/mp4" },
          { name: "bun-runtime.mp4", size: 120 * MB, mimeType: "video/mp4" },
        ],
        children: [
          {
            name: "Exercises",
            files: [
              { name: "exercise-01.ts", size: 3 * KB, mimeType: "text/typescript" },
              { name: "exercise-02.ts", size: 4 * KB, mimeType: "text/typescript" },
            ],
          },
        ],
      },
      {
        name: "Recordings",
        files: [
          { name: "meeting-2025-01-15.mkv", size: 1.2 * MB * 1000, mimeType: "video/x-matroska" },
          { name: "demo-recording.webm", size: 80 * MB, mimeType: "video/webm" },
        ],
      },
    ],
  },
  {
    name: "Downloads",
    files: [
      { name: "setup.exe", size: 120 * MB, mimeType: "application/x-msdownload" },
      { name: "archive.zip", size: 45 * MB, mimeType: "application/zip" },
      { name: "ebook.epub", size: 2 * MB, mimeType: "application/epub+zip" },
    ],
    children: [
      {
        name: "Software",
        files: [
          { name: "vscode-1.85.dmg", size: 95 * MB, mimeType: "application/x-apple-diskimage" },
          { name: "docker-desktop.dmg", size: 550 * MB, mimeType: "application/x-apple-diskimage" },
          { name: "bun-v1.1.0.zip", size: 30 * MB, mimeType: "application/zip" },
        ],
      },
      {
        name: "Fonts",
        files: [
          { name: "inter-variable.woff2", size: 300 * KB, mimeType: "font/woff2" },
          { name: "jetbrains-mono.zip", size: 1.5 * MB, mimeType: "application/zip" },
        ],
      },
    ],
  },
  {
    name: "Development",
    children: [
      {
        name: "Projects",
        children: [
          {
            name: "windows-explorer-ai",
            files: [
              { name: "README.md", size: 5 * KB, mimeType: "text/markdown" },
              { name: "docker-compose.yml", size: 2 * KB, mimeType: "text/yaml" },
              { name: ".env.example", size: 500, mimeType: "text/plain" },
            ],
            children: [
              {
                name: "apps",
                children: [
                  {
                    name: "backend",
                    files: [
                      { name: "package.json", size: 1 * KB, mimeType: "application/json" },
                      { name: "tsconfig.json", size: 800, mimeType: "application/json" },
                    ],
                  },
                  {
                    name: "frontend",
                    files: [
                      { name: "package.json", size: 1.2 * KB, mimeType: "application/json" },
                      { name: "vite.config.ts", size: 600, mimeType: "text/typescript" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: "portfolio-site",
            files: [
              { name: "README.md", size: 3 * KB, mimeType: "text/markdown" },
              { name: "index.html", size: 8 * KB, mimeType: "text/html" },
            ],
          },
        ],
      },
      {
        name: "Tools",
        files: [
          { name: "aliases.sh", size: 4 * KB, mimeType: "application/x-sh" },
          { name: "setup.sh", size: 6 * KB, mimeType: "application/x-sh" },
        ],
        children: [
          {
            name: "Scripts",
            files: [
              { name: "backup.sh", size: 2 * KB, mimeType: "application/x-sh" },
              { name: "deploy.sh", size: 5 * KB, mimeType: "application/x-sh" },
              { name: "cleanup.sh", size: 1 * KB, mimeType: "application/x-sh" },
            ],
          },
        ],
      },
    ],
  },
]

// ─── Recursive insert ─────────────────────────────────────────────────────────

async function insertFolder(
  folder: SeedFolder,
  parentId: string | null = null
): Promise<void> {
  const [inserted] = await db
    .insert(folders)
    .values({ name: folder.name, parentId })
    .returning({ id: folders.id })

  const folderId = inserted.id

  // Insert files for this folder
  if (folder.files && folder.files.length > 0) {
    await db.insert(files).values(
      folder.files.map((f) => ({
        folderId,
        name: f.name,
        size: Math.floor(f.size), // Ensure integer for bigint column
        mimeType: f.mimeType,
      }))
    )
  }

  // Recursively insert children
  if (folder.children) {
    for (const child of folder.children) {
      await insertFolder(child, folderId)
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  console.log("🌱 Starting seed...")

  // Clear existing data (respects FK cascade)
  console.log("🗑️  Clearing existing data...")
  await db.delete(files)
  await db.delete(folders)

  // Insert tree
  console.log("📁 Inserting folder and file tree...")
  for (const rootFolder of SEED_TREE) {
    await insertFolder(rootFolder, null)
  }

  console.log("✅ Seed completed successfully!")
  console.log("   📂 Folders inserted across 5 levels of nesting")
  console.log("   📄 Files inserted with realistic names and sizes")
  process.exit(0)
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})
