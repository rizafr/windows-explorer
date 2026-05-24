import { createApp } from "./app"

const port = Number(process.env.BACKEND_PORT ?? 3001)
const hostname = process.env.BACKEND_HOST ?? "localhost"
const app = createApp()

app.listen({ port, hostname }, () => {
  console.log(`🦊 Windows Explorer API running at http://${hostname}:${port}`)
  console.log(`📖 Swagger docs: http://${hostname}:${port}/docs`)
  console.log(`❤️  Health check: http://${hostname}:${port}/health`)
})
