export const x = <T>(x: T | null | undefined): T => {
  if (x === null) throw new Error("should not be null");
  if (x === undefined) throw new Error("should not be undefined");
  return x;
};
