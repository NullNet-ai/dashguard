"use client";

const Summary = () => {
  return <></>;
};

const ConfirmationSummary = {
  label: "Step 2",
  required: false,
  components: [
    {
      label: "Confirmation",
      component: <Summary />,
    },
  ],
};


export default ConfirmationSummary;
