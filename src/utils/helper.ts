type Obj = Record<string, unknown>;
export const objectHasData = (data: Obj = {}) => {
  if (!data) {
    return false;
  }

  return Object.keys(data).length > 0;
};
