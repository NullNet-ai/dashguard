'use client';

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useSidebar } from "~/components/ui/sidebar";
import useScreenType from "~/hooks/use-screen-type";
import { cn } from "~/lib/utils";

type SideInfoProps = {
    user_name?: string;
    email?: string;
    initials?: any
    screenType?: string
}

const SideUserInfo = ({ user_name, email, initials, screenType }: SideInfoProps) => {

    const { open, openMobile } = useSidebar();
    const screen = useScreenType() || screenType;
    const mobile = (screen !== 'lg' && screen !== 'xl' && screen !== '2xl');
    

    return (
        <div className="grid place-items-center px-2">
            <div className={cn(`flex items-center gap-2 px-1 py-1.5 text-left text-sm`, 
                `${(open || openMobile) && mobile ? 'w-full' : ''} `
            )}>
                <Avatar className="h-8 w-8 rounded-full">
                    <AvatarImage
                    // insert image src here for the user
                        alt={user_name}
                    />
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className={cn(`grid flex-1 text-left text-sm leading-tight`,
                    `${ ((open && !mobile) || (openMobile && mobile)  || (open && !openMobile && !mobile) ) ? '' : 'hidden'}`
                )}>
                    {/* <span className="truncate font-semibold">{user_name}</span>
                <span className="truncate text-xs">{org_name}</span> */}
                    <span className="truncate font-semibold">{user_name}</span>
                    <span className="truncate text-xs">{email || 'superadmin@dnamicro.com'}</span>
                </div>
            </div>
        </div>
    )
}

export default SideUserInfo