export default function Layout(props: {children: React.ReactNode, params: any}) {

    const { params, children, ...rest } = props
    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pt-0  lg:-mt-4 md:mt-2">
            {...Object.values(rest)}
        </section>
    );
}