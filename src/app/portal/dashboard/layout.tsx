export default function Layout(props: {children: React.ReactNode}) {

    const { params, children, ...rest } = props
    return (
        <section>
            {...Object.values(rest)}
        </section>
    );
}