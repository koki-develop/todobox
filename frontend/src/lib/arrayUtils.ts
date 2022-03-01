import { arrayMoveImmutable } from "array-move";

export const arrayMove = <T>(array: T[], from: number, to: number): T[] => {
  return arrayMoveImmutable(array, from, to);
};

export const arrayMoveToArray = <T>(
  fromArray: T[],
  toArray: T[],
  from: number,
  to: number
): [T[], T[]] => {
  const fromArrayClone = fromArray.concat();
  const toArrayClone = toArray.concat();

  const [elm] = fromArrayClone.splice(from, 1);
  toArrayClone.splice(to, 0, elm);

  return [fromArrayClone, toArrayClone];
};
