import type { LeadQuery } from "@/lib/crm/leads";

export function leadQueryFromUrl(url: URL): LeadQuery {
  const params = url.searchParams;
  const dir = params.get("dir");
  const page = params.get("page");
  const pageSize = params.get("pageSize");
  return {
    search: params.get("search") || undefined,
    ownerId: params.get("ownerId") || undefined,
    stage: params.get("stage") || undefined,
    productCategory: params.get("productCategory") || undefined,
    vertical: params.get("vertical") || undefined,
    source: params.get("source") || undefined,
    targetCountry: params.get("targetCountry") || undefined,
    temperature: params.get("temperature") || undefined,
    grade: params.get("grade") || undefined,
    status: params.get("status") || undefined,
    duplicate: params.get("duplicate") || undefined,
    dataAlert: params.get("dataAlert") || undefined,
    enquiryFrom: params.get("enquiryFrom") || undefined,
    enquiryTo: params.get("enquiryTo") || undefined,
    archived: params.get("archived") || undefined,
    sort: params.get("sort") || undefined,
    dir: dir === "asc" || dir === "desc" ? dir : undefined,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
  };
}
