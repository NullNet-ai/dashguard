interface TemplateData {
  [key: string]: any;
}

export const replaceTemplateVariables = (
  template: string,
  data: TemplateData
): string => {
  return template.replace(/{([^}]+)}/g, (match, variable) => {
    const keys = variable.trim().split('.');
    let value = data;

    for (const key of keys) {
      if (!value || typeof value !== 'object') {
        return match;
      }
      value = value[key];
    }

    if (value === null || value === undefined) {
      return match;
    }

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  });
};