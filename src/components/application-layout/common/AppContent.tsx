import { headers } from "next/headers";
import { cn } from "~/lib/utils";

const AppContent = ({ children }: any) => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , , application, identifier] = pathname.split("/");

  const mtop = application === "record" ? "mt-[116px]" : "mt-[140px]";

  return (
    <div
      className={cn(
        `mb-12 md:mt-24 lg:mb-0 lg:mt-0`,
        `${application === "grid" ? "mt-[80px] pt-2 lg:pt-0" : mtop}`,
      )}
    >
      {children}
    </div>
  );
};

export default AppContent;
