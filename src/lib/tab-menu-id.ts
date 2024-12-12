export const tabMenuId = ({
  _mainEntity,
  _application,
  _id,
}: {
  _mainEntity: string;
  _application: string;
  _id: string;
}) => {
  return `${_id}:${_mainEntity}:${_application}`;
};
