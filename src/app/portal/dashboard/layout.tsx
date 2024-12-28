export default function Layout(props: {children: React.ReactNode}) {

    const { params, children, ...rest } = props
    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {...Object.values(rest)}
        </section>
    );
}