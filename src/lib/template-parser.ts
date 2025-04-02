interface TemplateData {
  [key: string]: {
    [key: string]: string | number;
  };
}

export const replaceTemplateVariables = (
  template: string,
  data: TemplateData
): string => {
  return template.replace(/\{([a-zA-Z0-9_.]+)\}/g, (match, path) => {
    const [entity, field] = path.split('.');
    return data[entity]?.[field]?.toString() || match;
  });
};
