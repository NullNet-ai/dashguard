import { EClientDatabaseProvider, ORM } from "@dna-platform/common-orm";
import axios from "axios";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  {
    params,
  }: {
    params: { file_id: string };
  },
) {
  const orm = ORM({
    storage_type: EClientDatabaseProvider.LOCAL,
  });
  const cookieStore = cookies();
  const { value: token = null } = cookieStore.get("token") || {};

  if (!token) {
    return NextResponse.json({ message: "No token found" }, { status: 401 });
  }

  if (!params.file_id) {
    return NextResponse.json({ message: "No file_id found" }, { status: 400 });
  }

  const { data } = await orm
    .getFileById(params.file_id, {
      query: {
        pluck: ["filename", "filepath", "mimetype"],
      },
      token,
    })
    .execute();
  const client = axios.create({
    baseURL: `${process.env.STORE_URL}/api/file/${params.file_id}/download`,
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
    responseType: "stream",
  });

  const upstreamResponse = await client.get("/");

  const response = new NextResponse(upstreamResponse.data, {
    headers: { "content-type": data?.[0]?.mimetype },
  });

  return response;
}
