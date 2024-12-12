"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function PrevPage() {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , mainEntity, application = "wizard", identifier, currentStep] =
    pathname.split("/");
  const fullSearchQueryParams =
    headerList.get("x-full-search-query-params") || "";
  if (application !== "wizard" || !identifier) return;
  if (Number(currentStep) === 1) return;
  const step = Number(currentStep) - 1;
  api.wizard.wizardCreateStep({
    identifier,
    entity: mainEntity!,
    step: step.toString(),
  });
  if (fullSearchQueryParams) {
    redirect(
      `/portal/${mainEntity}/wizard/${identifier}/${step}?${fullSearchQueryParams}`,
    );
  }
  redirect(`/portal/${mainEntity}/wizard/${identifier}/${step}`);
}
