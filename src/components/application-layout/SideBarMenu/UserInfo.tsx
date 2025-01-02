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
                        src={
                            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
                        }
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