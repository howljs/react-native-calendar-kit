export const isNullOrUndefined = <T extends any>(value: T) => {
  return value === null || value === undefined;
};

export const valueWithDefault = <T extends any>(
  value: T | undefined | null,
  defaultValue: T
) => {
  return (isNullOrUndefined(value) ? defaultValue : value) as T;
};
