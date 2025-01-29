import TabList from "./TabList";
import { Fragment } from "react";

export default function Tab() {
  return (
    <Fragment>
      <div className="">
        <img
          alt="Your Company"
          src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=500"
          className="ml-4 hidden h-10"
        />
      </div>
      <div className="lg:block">
        <div>
          <TabList />
        </div>
      </div>
    </Fragment>
  );
}
