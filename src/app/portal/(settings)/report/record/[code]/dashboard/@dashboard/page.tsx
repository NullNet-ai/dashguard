import { headers } from "next/headers";
const RecordTabContainer = async () => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , , application, identifier] = pathname.split("/");

  return <div className="space-y-2">Dashboard</div>;
};

export default RecordTabContainer;
