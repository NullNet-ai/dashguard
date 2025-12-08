import { EClientDatabaseProvider, ORM } from '@dna-platform/common-orm'
import axios from 'axios'
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { api } from "~/trpc/server";

export async function GET(
  _: NextRequest,
  props: {
    params: Promise<{ file_id: string }>
  }
) {
  const params = await props.params;
  const orm = ORM({
    storage_type: EClientDatabaseProvider.LOCAL,
  })
  const cookieStore = await cookies()
  const { value: email = '' } = cookieStore.get("username") || {};

  const token = await api.auth.getToken({
    username: email,
  })

  if (!token) {
    return NextResponse.json({ message: 'No token found', error: 'no token' }, { status: 401 })
  }

  if (!params.file_id) {
    return NextResponse.json({ message: 'No file_id found', error: 'no file' }, { status: 400 })
  }

  const { data } = await orm
    .getFileById(params.file_id, {
      query: {
        pluck: ['filename', 'filepath', 'mimetype'],
      },
      token,
    })
    .execute()

  const client = axios.create({
    baseURL: `${process.env.STORE_URL}/api/file/${params.file_id}/download`,
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`,
    },
    responseType: 'stream',
  })

  const upstreamResponse = await client.get('/')

  const response = new NextResponse(upstreamResponse.data, {
    headers: { 'content-type': data?.[0]?.mimetype },
  })

  return response
}
