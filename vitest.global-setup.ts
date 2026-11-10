import { execSync } from "child_process";
import { readFileSync, rmSync } from "fs";

export default function setup() {
  const schema = readFileSync("prisma/schema.prisma", "utf8");
  if (!schema.includes('provider = "sqlite"')) {
    console.log("CRM tests use the pure metric checks. The database is Postgres, so the sqlite test database is not rebuilt.");
    return;
  }
  rmSync("prisma/test.db", { force: true });
  rmSync("prisma/test.db-journal", { force: true });
  rmSync("prisma/test.db-wal", { force: true });
  rmSync("prisma/test.db-shm", { force: true });
  execSync("npx prisma db push --skip-generate", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: "file:./prisma/test.db" },
  });
}
