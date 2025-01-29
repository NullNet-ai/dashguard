export const pluralize = (entity: string) => {
    if (entity.endsWith("y") && !/[aeiou]y$/.test(entity)) {
      return entity.slice(0, -1) + "ies";
    } else if (
      entity.endsWith("s") ||
      entity.endsWith("x") ||
      entity.endsWith("z") ||
      entity.endsWith("ch") ||
      entity.endsWith("sh")
    ) {
      return entity + "es";
    } else {
      return entity + "s";
    }
  };