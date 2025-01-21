import { EClientDatabaseProvider, ORM } from "@dna-platform/common-orm";
import axios from "axios";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { api } from "~/trpc/server";

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

  const data: any = await api.files.getFileById({
    ids: [params.file_id],
    pluck_fields: ["filename", "filepath", "mimetype", "download_path", "size"],
  });

  const url = `${process.env.STORE_URL}${data[0]?.download_path}`;
  try {
    const upstreamResponse = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "stream",
    });

    const response = new NextResponse(upstreamResponse.data, {
      headers: {
        "Content-Type": data?.[0]?.mimetype,
        "Content-Length": data?.[0]?.size,
      },
      //@ts-expect-error - NextResponse does not have a body property
      body: upstreamResponse.data,
    });

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { message: error.message },
        { status: error.response?.status || 500 },
      );
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
