"use server";

import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function LoginSubmit({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const response = await api.auth.login({
    email,
    password,
  });

  await api.auth.verify();

  if ("statusCode" in response && response.statusCode !== 200) {
    return JSON.parse(JSON.stringify(response));
  }

  redirect("/portal/dashboard");
}
