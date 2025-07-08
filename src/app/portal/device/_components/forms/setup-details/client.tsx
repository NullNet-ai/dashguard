'use client';

import React from 'react';
import Markdown from 'react-markdown';

type SetupDetailsProps = {
  installationKey: string;
  markdownTemplate: string;
};

const SetupDetails: React.FC<SetupDetailsProps> = ({
  markdownTemplate,
  installationKey,
}) => {
  const markdown = React.useMemo(
    () => markdownTemplate.replace('${INSTALLATION_KEY}', installationKey),
    [markdownTemplate, installationKey],
  );

  return <Markdown>{markdown}</Markdown>;
};

export default SetupDetails;
