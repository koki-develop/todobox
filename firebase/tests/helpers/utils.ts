export const deleteKeys = <T extends {}>(obj: T, ...keys: string[]) => {
  const clone = { ...obj };
  for (const key of keys) {
    delete clone[key];
  }
  return clone;
};
