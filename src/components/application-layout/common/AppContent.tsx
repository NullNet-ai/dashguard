import { headers } from "next/headers";
import { cn } from "~/lib/utils";


const AppContent = ({ children }: any) => {

    const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, application, identifier] = pathname.split("/");

    return (
        <div className={cn(` md:mt-24 lg:mb-0 mb-12  lg:mt-0`, 
            `${application === 'grid' ? 'mt-[80px] pt-2' : 'mt-[140px]'}`
        )}>
            {children}
        </div>
    )
}

export default AppContent