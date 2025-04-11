export const tabMenuId = ({
  _mainEntity,
  _application,
  _id,
  _gridKey,
}: {
  _mainEntity: string;
  _application: string;
  _id: string;
  _gridKey?: string;
}) => {
  if (_application === 'grid') {
    return `${_id}:${_mainEntity}:${_application}`;
  }
  return `${_id}:${_mainEntity}:${_application}:grid:${_gridKey ?? ''}`;
};
