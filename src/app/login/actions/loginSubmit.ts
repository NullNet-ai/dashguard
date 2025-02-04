"use server";

import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function LoginSubmit({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  const response = await api.auth.login({
    username,
    password,
  });

  await api.auth.verify();

  if ("statusCode" in response && response.statusCode !== 200) {
    return JSON.parse(JSON.stringify(response));
  }

  redirect("/portal/dashboard");
}
