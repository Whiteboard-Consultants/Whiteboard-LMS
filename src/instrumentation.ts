export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.CRON_ENABLED !== "true") return;
  const { default: cron } = await import("node-cron");
  const { sendDailyDigests } = await import("@/lib/crm/digest");
  const schedule = process.env.CRON_SCHEDULE || "0 8 * * *";
  cron.schedule(
    schedule,
    () => {
      void sendDailyDigests().catch((error: unknown) => {
        console.error("[crm-digest]", error);
      });
    },
    { timezone: "Asia/Kolkata" },
  );
  console.log(`[crm-digest] scheduled ${schedule} Asia/Kolkata`);
}
