"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function PrevPage() {
  const headerList = headers();
  const pathname = (headerList.get("x-pathname") || "").split('/');
  let [, , mainEntity, application = "wizard", identifier, currentStep] =
    pathname
  if (!!process.env.NEXT_PUBLIC_IS_PLAYGROUND) {
    const [,,playgroundApplication,,,playgroundIdentifier, playgroundStep] = pathname
    application = playgroundApplication || "wizard"
    identifier = playgroundIdentifier
    currentStep = playgroundStep
    mainEntity = "contact";
  }
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
