"use client";

const Summary = () => {
  return <></>;
};

const SummaryConfig = {
  label: "Step 5",
  required: false,
  show_summary: true,
  components: [
    {
      label: "Confirmation",
      component: <Summary />,
    },
  ],
};

export default SummaryConfig;
