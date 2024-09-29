export const isNullOrUndefined = <T>(
  value: T | null | undefined
): value is null | undefined => {
  return value === null || value === undefined;
};

export const valueWithDefault = <T>(
  value: T | undefined | null,
  defaultValue: T
): T => {
  return isNullOrUndefined(value) ? defaultValue : value;
};
