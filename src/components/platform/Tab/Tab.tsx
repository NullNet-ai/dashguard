import { Fragment } from 'react';

import TabList from './TabList';

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
      <div className="flex flex-1 mr-1">
        <TabList />
      </div>
    </Fragment>
  );
}
