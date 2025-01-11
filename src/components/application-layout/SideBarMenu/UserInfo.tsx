'use client';

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useSidebar } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

type SideInfoProps = {
    user_name?: string;
    email?: string;
    initials?: any
}

const SideUserInfo = ({ user_name, email, initials }: SideInfoProps) => {

    const { open } = useSidebar();

    return (
        <div className="grid place-items-center">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                    // insert image src here for the user
                        alt={user_name}
                    />
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className={cn(`grid flex-1 text-left text-sm leading-tight`,
                    `${open ? '' : 'hidden'}`
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