import { headers } from "next/headers";
import { cn } from "~/lib/utils";

const AppContent = ({ children }: any) => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, ,firstSegment ,application, , identifier] = pathname.split("/");

  const mtop =
    application === "record"
      ? "lg:mt-[0px] md:mt-[53px] mt-[80px]"
      : application === "wizard"
        ? "lg:mt-[0] mt-[80px] md:mt-[53px]"
        : firstSegment === 'dashboard' ? "lg:mt-[50px] md:mt-[80px] mt-[100px]" : "mt-[140px]";

  return (
    <div
      className={cn(
        `mb-12 lg:mb-0 lg:mt-0`,
        `${application === "grid" ? "mt-[80px] pt-2 md:mt-[45px] lg:mt-[0px] lg:pt-0" : mtop}`,
      )}
    >
      {children}
    </div>
  );
};

export default AppContent;
