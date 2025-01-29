// "use client";

import HeaderTabs from "~/components/platform/Record/Tabs/HeaderTabs";
// import { useState } from "react";
import tabs from "../../record/_config/tabs";
import ConfigurationRuleGrid from "./ConfigurationRuleGrid";

export default function RecordConfigurationTabs() {
  // const [showMore, setShowMore] = useState(false);

  return (
    <>
      <div>Rules</div>
      <ConfigurationRuleGrid />
    </>
  );
}
