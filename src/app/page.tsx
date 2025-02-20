import { headers } from 'next/headers';
import { redirect } from "next/navigation";

export default function Page() {
  const headerList = headers();
  const requestParams = headerList.get("x-full-search-query-params") || "";
  const urlParams = new URLSearchParams(requestParams);
  const parsedAccountId = urlParams.get('account_id');
 
  return redirect("/portal/dashboard");
}
