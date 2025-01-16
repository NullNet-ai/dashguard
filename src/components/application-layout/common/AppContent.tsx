import { headers } from "next/headers";
import { cn } from "~/lib/utils";


const AppContent = ({ children }: any) => {

    const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , , application, identifier] = pathname.split("/");

    const mtop = application === 'record' ? 'mt-[116px]' : 'mt-[120px]'

    return (
        <div className={cn(`  lg:mb-0 mb-12  lg:mt-0`, 
            `${application === 'grid' ? 'md:mt-[20px] lg:mt-[0px] pt-2 lg:pt-2 mt-[80px]' : mtop}`
        )}>
            {children}
        </div>
    )
}

export default AppContent