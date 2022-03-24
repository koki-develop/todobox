export const pickKeys = <T extends {}>(obj: T, ...keys: (keyof T)[]) => {
  const clone = { ...obj };
  for (const key of Object.keys(obj)) {
    if (!keys.includes(key as keyof T)) {
      delete clone[key];
    }
  }
  return clone;
};

export const deleteKeys = <T extends {}>(obj: T, ...keys: (keyof T)[]) => {
  const clone = { ...obj };
  for (const key of keys) {
    delete clone[key];
  }
  return clone;
};
