-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "crm";

-- CreateTable
CREATE TABLE "crm"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."Lead" (
    "id" TEXT NOT NULL,
    "leadCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enquiryDate" TIMESTAMP(3) NOT NULL,
    "source" TEXT,
    "campaign" TEXT,
    "ownerId" TEXT,
    "mobile" TEXT,
    "email" TEXT,
    "city" TEXT,
    "currentLevel" TEXT,
    "passoutYear" INTEGER,
    "stream" TEXT,
    "institution" TEXT,
    "parentName" TEXT,
    "parentMobile" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "productCategory" TEXT,
    "programmeDetail" TEXT,
    "targetCountry" TEXT,
    "targetIntake" TEXT,
    "budget" DOUBLE PRECISION,
    "stage" TEXT,
    "temperature" TEXT,
    "firstContactDue" TIMESTAMP(3),
    "counsellingDate" TIMESTAMP(3),
    "expectedValue" DOUBLE PRECISION,
    "closedDate" TIMESTAMP(3),
    "lostReason" TEXT,
    "remarks" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."Activity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "channel" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "loggedById" TEXT,
    "summary" TEXT NOT NULL,
    "nextFollowUpDate" TIMESTAMP(3),
    "nextAction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."StageHistory" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "fromStage" TEXT,
    "toStage" TEXT NOT NULL,
    "changedById" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."LookupValue" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "meta" JSONB,

    CONSTRAINT "LookupValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."Setting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "crm"."ApiKey" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "crm"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_leadCode_key" ON "crm"."Lead"("leadCode");

-- CreateIndex
CREATE INDEX "Lead_mobile_idx" ON "crm"."Lead"("mobile");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "crm"."Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_ownerId_idx" ON "crm"."Lead"("ownerId");

-- CreateIndex
CREATE INDEX "Lead_stage_idx" ON "crm"."Lead"("stage");

-- CreateIndex
CREATE INDEX "Lead_enquiryDate_idx" ON "crm"."Lead"("enquiryDate");

-- CreateIndex
CREATE INDEX "Lead_archived_idx" ON "crm"."Lead"("archived");

-- CreateIndex
CREATE INDEX "Activity_leadId_idx" ON "crm"."Activity"("leadId");

-- CreateIndex
CREATE INDEX "Activity_date_idx" ON "crm"."Activity"("date");

-- CreateIndex
CREATE INDEX "Activity_loggedById_idx" ON "crm"."Activity"("loggedById");

-- CreateIndex
CREATE INDEX "StageHistory_leadId_idx" ON "crm"."StageHistory"("leadId");

-- CreateIndex
CREATE INDEX "LookupValue_type_sortOrder_idx" ON "crm"."LookupValue"("type", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "LookupValue_type_label_key" ON "crm"."LookupValue"("type", "label");

-- AddForeignKey
ALTER TABLE "crm"."Lead" ADD CONSTRAINT "Lead_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "crm"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."Activity" ADD CONSTRAINT "Activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "crm"."Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."Activity" ADD CONSTRAINT "Activity_loggedById_fkey" FOREIGN KEY ("loggedById") REFERENCES "crm"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."StageHistory" ADD CONSTRAINT "StageHistory_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "crm"."Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."StageHistory" ADD CONSTRAINT "StageHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "crm"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

