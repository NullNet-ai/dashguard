/**
 * Generates a unique tab menu ID based on provided parameters
 * Used for caching and identifying tab menus across the application
 */
export const tabMenuId = ({
  _mainEntity,
  _application,
  _id,
  _gridKey,
  _identifier
}: {
  _mainEntity: string;
  _application: string;
  _id: string;
  _gridKey?: string;
  _identifier?: string;
}): string => {
  const baseId = `${_id}:${_mainEntity}:${_application}`;
  if (_gridKey) {
    if (_identifier) {
      return `${baseId}:grid:${_gridKey}:${_identifier}`;
    }
    return `${baseId}:grid:${_gridKey}`;
  }
  if (_identifier) {
    return `${baseId}:grid:${_identifier}`;
  }
  return baseId;
};
