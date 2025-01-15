import { Fragment } from "react";
import { Loader } from "~/components/ui/loader";

export default function Page() {
  return (
    <Fragment>
      <Loader variant="spinner" size="md" className="bg-blue-500" />

      <Loader variant="circular" size="md" className="bg-blue-500" />
      <Loader variant="circularShadow" size="md" className="bg-blue-500" />
      <Loader
        size="md"
        customImage="https://icons8.com/preloaders/preloaders/1474/Walk.gif"
        imageAlt="Custom loading animation"
      />
    </Fragment>
  );
}
