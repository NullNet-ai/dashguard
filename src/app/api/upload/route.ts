import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { api } from '~/trpc/server';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const { value: email = '' } = cookieStore.get("username") || {};

  const token = await api.auth.getToken({
    username: email,
  })

  if (!token) {
    return NextResponse.json({ message: "No token found" }, { status: 401 });
  }

  const formData = await req.formData();
  const client = axios.create({
    baseURL: `${process.env.STORE_URL}/api/file/upload`,
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
      Cookie: `token=${token}`,
    },
  });
  const response = await client.post("/", formData);
  return NextResponse.json(response.data);
}
