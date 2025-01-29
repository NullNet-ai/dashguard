import NewComingSoon from "~/app/coming-soon";
import RecordImplementationGuide from "../../../../_components/record_guideline";
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const RecordTabContainer = async () => {
  return (
    <div>
      <RecordImplementationGuide />
      <NewComingSoon type="inner-component" />
    </div>
  );
};

export default RecordTabContainer;
