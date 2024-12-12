"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function NextPage() {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const fullSearchQueryParams =
    headerList.get("x-full-search-query-params") || "";
  const [, , mainEntity, application = "wizard", identifier, currentStep] =
    pathname.split("/");
  if (application !== "wizard" || !identifier) return;

  const step = Number(currentStep) + 1;
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
