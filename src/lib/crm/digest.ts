import nodemailer from "nodemailer";
import { formatDisplay } from "@/lib/crm/dates";
import { prisma } from "@/lib/crm/db";
import { listLeads, type LeadView } from "@/lib/crm/leads";

function mailer() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

function digestText(name: string, leads: LeadView[]): string {
  const lines = [
    `Hello ${name},`,
    "",
    `You have ${leads.length} follow-up${leads.length === 1 ? "" : "s"} that need attention today.`,
    "",
  ];
  for (const lead of leads) {
    lines.push(
      `${lead.leadCode}  ${lead.name}  ${lead.followUpStatus}  ${lead.mobile ?? "no mobile"}  next ${formatDisplay(lead.nextFollowUpDate)}  ${lead.daysOverdue ? `${lead.daysOverdue}d overdue` : "due today"}`,
    );
    if (lead.latestNote) lines.push(`  ${lead.latestNote}`);
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  if (base) lines.push("", `Open Today: ${base.replace(/\/$/, "")}/crm/today`);
  return lines.join("\n");
}

export async function sendDailyDigests() {
  const users = await prisma.user.findMany({ where: { active: true } });
  const transport = mailer();
  let sent = 0;
  let logged = 0;

  for (const user of users) {
    const list = await listLeads(
      {
        ownerId: user.id,
        status: "Overdue,Due Today",
        sort: "daysOverdue",
        dir: "desc",
        exportAll: true,
      },
      user,
    );
    if (list.rows.length === 0) continue;
    const subject = `CRM follow-ups: ${list.summary.overdue} overdue, ${list.summary.dueToday} due today`;
    const text = digestText(user.name, list.rows);
    if (!transport) {
      console.log(`\n[crm-digest] SMTP is not configured. Would email ${user.email}\nSubject: ${subject}\n${text}\n`);
      logged += 1;
      continue;
    }
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject,
      text,
    });
    sent += 1;
  }

  return { sent, logged };
}
