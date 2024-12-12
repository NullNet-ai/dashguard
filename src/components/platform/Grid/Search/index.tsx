import GridSearchProvider from "./Provider";
import Search from "./View";

export default function Main() {
  return (
    <GridSearchProvider>
      <Search />
    </GridSearchProvider>
  );
}
