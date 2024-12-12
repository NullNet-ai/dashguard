import TabList from "./TabList";
import { Fragment } from "react";

export default function Tab() {
  return (
    <Fragment>
      <div className="">
        {/* <label htmlFor="tabs" className="sr-only">
          Select a tab
          </label> */}
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        {/* <SelectedTab tabs={tabs} /> */}

        <img
          alt="Your Company"
          src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=500"
          className="ml-4 h-10 hidden"
        />
      </div>
      <div className=" lg:block">
        <div>
          <TabList />
        </div>
      </div>
    </Fragment>
  );
}
