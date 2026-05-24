export function normalizeDatabaseUrl(connectionString: string): string {
  let url: URL

  try {
    url = new URL(connectionString)
  } catch {
    return connectionString
  }

  const database = url.searchParams.get("database")

  if (database) {
    const hasDatabasePath = url.pathname && url.pathname !== "/"

    if (!hasDatabasePath) {
      url.pathname = `/${encodeURIComponent(database)}`
    }

    url.searchParams.delete("database")
  }

  return url.toString()
}
