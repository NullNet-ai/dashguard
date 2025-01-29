import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function Page({
  params,
}: {
  params: {
    code: string;
  };
}) {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , mainEntity, ,] = pathname.split("/");
  const stepDetails = await api.wizard.getTraverseStepped(
    `${mainEntity}:wizard:${params?.code}`,
  );

  if (!stepDetails) {
    return redirect(`/portal/${mainEntity}/wizard/${params?.code}/1`);
  }

  return redirect(stepDetails?.pathname);
}
