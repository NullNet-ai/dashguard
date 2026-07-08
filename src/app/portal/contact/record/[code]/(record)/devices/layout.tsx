/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';

const RecordLayout: React.FC<any> = (props) => {
  const { params, children, ...rest } = props;
  return <div className="space-y-2">{Object.values(rest)}</div>;
};

export const dynamic = 'force-dynamic'

export default RecordLayout;
