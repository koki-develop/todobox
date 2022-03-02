export const arrayMove = <T>(array: T[], from: number, to: number): T[] => {
  const arrayClone = array.concat();
  if (arrayClone.length === 0) return arrayClone;

  if (from < 0) from = 0;
  if (to < 0) to = 0;
  if (from > arrayClone.length - 1) from = arrayClone.length - 1;
  if (to > arrayClone.length - 1) to = arrayClone.length - 1;

  if (from === to) {
    return arrayClone;
  }

  const [elm] = arrayClone.splice(from, 1);
  arrayClone.splice(to, 0, elm);
  return arrayClone;
};

export const arrayMoveToArray = <T>(
  fromArray: T[],
  toArray: T[],
  from: number,
  to: number
): [T[], T[]] => {
  const fromArrayClone = fromArray.concat();
  const toArrayClone = toArray.concat();
  if (fromArrayClone.length === 0) return [fromArrayClone, toArrayClone];

  if (from < 0) from = 0;
  if (to < 0) to = 0;
  if (from > fromArrayClone.length - 1) from = fromArrayClone.length - 1;
  if (to > toArrayClone.length) to = toArrayClone.length;

  const [elm] = fromArrayClone.splice(from, 1);
  toArrayClone.splice(to, 0, elm);

  return [fromArrayClone, toArrayClone];
};
