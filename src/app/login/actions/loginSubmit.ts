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
  await api.auth.login({
    email,
    password,
  });
  redirect("/portal/dashboard");
}
