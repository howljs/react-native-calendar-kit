export const mergeDeep = <T extends Record<string, any>>(
  target: T,
  source: Partial<T> = {},
  isNewObject: boolean = false
): T => {
  const isObject = (obj: any): obj is Record<string, any> =>
    obj && typeof obj === 'object';

  if (!isObject(target) || !isObject(source)) {
    return source as T;
  }
  const newObject: T = isNewObject ? { ...target } : target;
  Object.keys(source).forEach((key) => {
    const targetValue = target[key as keyof T];
    const sourceValue = source[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      newObject[key as keyof T] = targetValue.concat(sourceValue) as any;
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      newObject[key as keyof T] = mergeDeep(
        Object.assign({}, targetValue),
        sourceValue as Partial<Record<string, any>>
      ) as any;
    } else {
      newObject[key as keyof T] = sourceValue as any;
    }
  });

  return newObject;
};

export const clampValues = (value: number, min: number, max: number) => {
  'worklet';
  return Math.max(min, Math.min(value, max));
};

export const repeat = function <T>(value: T | T[], total: number): (T | T[])[] {
  let i = 0;
  const array: (T | T[])[] = [];

  if (Array.isArray(value)) {
    for (; i < total; i++) array[i] = ([] as T[]).concat(value);
  } else {
    for (; i < total; i++) array[i] = value;
  }
  return array;
};

export function padStart(
  item: string | number,
  targetLength: number,
  padString = ' '
) {
  const str = String(item);
  // eslint-disable-next-line no-bitwise
  targetLength = targetLength >> 0;
  if (str.length > targetLength) {
    return String(str);
  }

  targetLength = targetLength - str.length;
  if (targetLength > padString.length) {
    padString += repeat(padString, targetLength / padString.length);
  }

  return padString.slice(0, targetLength) + String(str);
}

export const isTwoFloatNumbersEqual = (
  num1: number,
  num2: number,
  epsilon: number = 0.1
) => {
  'worklet';
  return Math.abs(num1 - num2) < epsilon;
};
