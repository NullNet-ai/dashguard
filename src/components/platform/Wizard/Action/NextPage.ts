"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function NextPage() {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const fullSearchQueryParams =
    headerList.get("x-full-search-query-params") || "";
    const path =
    pathname.split("/");
  let [, , mainEntity, application = "wizard", identifier, currentStep] = path
  let version = "1"
  if (process.env.IS_PLAYGROUND) {
    const [, , playgroundApplication, , playgroundVersion, playgroundIdentifier, playgroundCurrentStep] = path
    application = playgroundApplication || "wizard";
    version = playgroundVersion || "1";
    identifier = playgroundIdentifier
    currentStep = playgroundCurrentStep
    mainEntity = "contact";
  }
  if (application !== "wizard" || !identifier) return;

  const step = Number(currentStep) + 1;
  api.wizard.wizardCreateStep({
    identifier,
    entity: mainEntity!,
    step: step.toString(),
  });

  if (fullSearchQueryParams) {
    if (process.env.IS_PLAYGROUND) {
      redirect(
        `/portal/wizard/version/${version}/${identifier}/${step}?${fullSearchQueryParams}`,
      );
    } else {
      redirect(
        `/portal/${mainEntity}/wizard/${identifier}/${step}?${fullSearchQueryParams}`,
      );
    }
  }
  if (process.env.IS_PLAYGROUND) {
    redirect(`/portal/wizard/version/${version}/${identifier}/${step}`);
  } else {
    redirect(`/portal/${mainEntity}/wizard/${identifier}/${step}`);
  }
}
