export const arrayMove = <T>(array: T[], from: number, to: number): T[] => {
  const arrayClone = array.concat();

  if (from < 0) from = 0;
  if (to < 0) to = 0;
  if (from > array.length - 1) from = array.length - 1;
  if (to > array.length - 1) to = array.length - 1;

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
  if (from < 0) from = 0;
  if (to < 0) to = 0;
  if (from > fromArray.length - 1) from = fromArray.length - 1;
  if (to > toArray.length) to = toArray.length;

  const fromArrayClone = fromArray.concat();
  const toArrayClone = toArray.concat();

  const [elm] = fromArrayClone.splice(from, 1);
  toArrayClone.splice(to, 0, elm);

  return [fromArrayClone, toArrayClone];
};
