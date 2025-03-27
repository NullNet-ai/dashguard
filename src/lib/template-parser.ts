interface QueryParam {
  entity: string;
  pluck: string[];
}

export const generateQueryParamsFromTemplate = (
  subject: string,
  content: string
): QueryParam[] => {
  const templateRegex = /\{([a-zA-Z0-9_.]+)\}/g;
  const paramsMap = new Map<string, Set<string>>();
  
  // Function to process matches
  const processMatches = (text: string) => {
    let match: any;
    while ((match = templateRegex.exec(text)) !== null) {
      const [entity, field] = match[1].split('.');
      if (!paramsMap.has(entity)) {
        paramsMap.set(entity, new Set(['id'])); // Always include id
      }
      paramsMap.get(entity)?.add(field);
    }
  };

  // Process both subject and content
  processMatches(subject);
  processMatches(content);

  // Convert Map to array of QueryParams
  return Array.from(paramsMap).map(([entity, fields]) => ({
    entity,
    pluck: Array.from(fields),
  }));
};