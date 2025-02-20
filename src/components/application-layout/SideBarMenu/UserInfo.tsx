'use client';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useSidebar } from '~/components/ui/sidebar';
import useScreenType from '~/hooks/use-screen-type';
import { cn } from '~/lib/utils';
import { api } from '~/trpc/react';

type SideInfoProps = {
  user_name?: string;
  email?: string;
  initials?: any;
  screenType?: string;
  organization?: string;
  other_organizations?: Array<Record<string, any>>;
};

const SideUserInfo = ({
  user_name,
  email,
  initials,
  screenType,
  organization,
  other_organizations,
}: SideInfoProps) => {
  const switchOrganization = api.auth.switchOrganization.useMutation();
  const { open, openMobile } = useSidebar();
  const screen = useScreenType() || screenType;
  const mobile = screen !== 'lg' && screen !== 'xl' && screen !== '2xl';
  const handleSwitchOrganization = async (
    organization: Record<string, any>,
  ) => {
    const response = await switchOrganization.mutateAsync({
      organization_id: organization.organization_id,
    });
    if (response) {
      const { organization_account_id } = response?.session?.account ?? {};
      window.open(`/?account_id=${organization_account_id}`, '_blank');
    }
    return;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="grid place-items-center px-2 hover:ring-0 active:ring-0">
        <div
          className={cn(
            `flex cursor-pointer items-center gap-2 px-1 py-1.5 text-left text-sm`,
            `${(open || openMobile) && mobile ? 'w-full' : ''} `,
          )}
        >
          <Avatar className="h-8 w-8 rounded-full">
            <AvatarImage
              // insert image src here for the user
              alt={user_name}
            />
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
          <div
            className={cn(
              `grid flex-1 text-left text-sm leading-tight`,
              `${(open && !mobile) || (openMobile && mobile) || (open && !openMobile && !mobile) ? '' : 'hidden'}`,
            )}
          >
            <span className="truncate font-semibold">{user_name}</span>
            <span className="truncate text-xs">{email}</span>
            <span className="truncate text-xs">{organization}</span>
          </div>
        </div>
      </DropdownMenuTrigger>
      {!!other_organizations?.length && (
        <DropdownMenuContent
          className="w-52"
          side="right"
          align="end"
          sideOffset={95}
        >
          <DropdownMenuLabel>Switch Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {other_organizations?.map((account, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => handleSwitchOrganization(account)}
            >
              <span className="mr-1 font-medium">{account.organization} </span>
              {account.role ? `(${account.role})` : ''}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

export default SideUserInfo;
