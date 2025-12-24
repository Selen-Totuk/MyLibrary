# Deployment Guide — MyLibrary

This guide shows two approaches to make the app public: a quick Render.com deploy (fast, SQLite local file — not recommended for production) and a recommended production setup using Render (Postgres) or Railway/Azure.

Prerequisites
- A GitHub repo with your project pushed
- A Render.com (or Railway/Azure) account
- .NET 9 SDK for local testing

Quick (fast) deploy to Render — SQLite (development/demo)
1. Commit and push your code to GitHub.
2. On Render.com create a new **Web Service** → Connect to GitHub and pick the repository and branch.
3. Build command:
   ```bash
   dotnet publish -c Release -o publish
   ```
4. Start command:
   ```bash
   dotnet MyLibrary.dll
   ```
   Render runs the published app in the `publish` folder by default; ensure the working directory is correct.
5. Environment: For demo, the app uses SQLite `library.db` by default (in repo root). Note: Render's filesystem is ephemeral on redeploy — data won't persist across deploys. This is fine for demo but not for real data.

Recommended: Render with Postgres (production-like)
1. On Render create a **Postgres** managed database (Marketplace → Postgres).
2. Copy the database connection string (URI). In Render set a secret env var `CONNECTION_STRING` with that value (or `DATABASE_URL`).
3. Update `Program.cs` to read the connection string and call `UseNpgsql(...)` for Postgres. Example snippet to add (requires `Npgsql.EntityFrameworkCore.PostgreSQL` package):

```csharp
var conn = builder.Configuration.GetConnectionString("DefaultConnection")
           ?? Environment.GetEnvironmentVariable("CONNECTION_STRING");
if (!string.IsNullOrEmpty(conn) && conn.Contains("Host="))
{
    builder.Services.AddDbContext<LibraryDbContext>(opt => opt.UseNpgsql(conn));
}
else
{
    builder.Services.AddDbContext<LibraryDbContext>(opt => opt.UseSqlite("Data Source=library.db"));
}
```

4. Add the NuGet package:
   ```bash
   dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
   ```
5. Create and apply EF migrations on Render or locally (locally recommended):
   ```bash
   dotnet ef database update --connection "<your-postgres-connection>"
   ```
6. In Render's Web Service set the build command and start command as above; set environment variable `ConnectionStrings__DefaultConnection` or `CONNECTION_STRING` to your Postgres connection string.

Railway / Azure / Others
- Railway has similar steps: add a PostgreSQL plugin, set env var, configure build/start commands.
- On Azure App Service you can use a managed PostgreSQL or Azure SQL and set `ConnectionStrings__DefaultConnection` in App Settings.

Notes & Recommendations
- For the course: a working public URL is required. If you need the fastest route, deploy with SQLite on Render for demo purposes, but document the limitation in your report (non-persistent storage). For full points prefer Postgres or Azure DB.
- Ensure `appsettings.Production.json` (or env vars) contains any secret keys.
- After deploy run `dotnet ef database update` (or let app run migrations at startup if you wire them).

If you want, I can:
- Update `Program.cs` to detect and use a connection string env var and add the Npgsql package automatically.
- Create a `render.yaml` manifest for Render deployment.
