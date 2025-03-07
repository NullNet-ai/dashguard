
import { cn } from '~/lib/utils';
import { PINNED_STATE_KEY as sideDrawerIsPinned } from '~/components/platform/SideDrawer/SideDrawerProvider';
import { SideDrawerView } from '~/components/platform/SideDrawer';
export default function Layout(props: { children: React.ReactNode, params: any }) {

    const { params, children, ...rest } = props
    return (
        <section className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pt-0  md:mt-2",
            sideDrawerIsPinned && "lg:grid-cols-[auto_auto_auto]"
        )}>
            {...Object.values(rest)}
            <SideDrawerView/>
        </section>
    );
}