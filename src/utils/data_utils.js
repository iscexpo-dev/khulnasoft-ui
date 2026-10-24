const getRepeatingValue = (index) => {
  const values = [
    100, 500, 400, 200, 100, 800, 400, 500, 600, 300, 800, 900, 110, 700, 400, 300, 500, 300, 400,
    600, 700,
  ];
  return index < values.length ? values[index] : values[index % values.length];
};

export const generateTimeSeries = () =>
  new Array(100).fill(0).map((el, i) => [new Date(2018, 0, i), getRepeatingValue(i)]);

// takes an element and a list and `intersperses' that element between the elements of the list.
// (',' ['a', 'b', 'c']) -> ['a', ',', 'b', ',', 'c']
export const intersperse = (separator, items) => {
  const [head, ...rest] = items;
  const separatorFactory = typeof separator === 'function' ? separator : () => separator;
  return [head, ...rest.flatMap((item) => [separatorFactory(), item], rest)];
};

// inserts a value at a given index into an array
// (1, 2, [1, 3, 4]) -> [1, 2, 3, 4]
export const insert = (index, newItem, items) => [
  ...items.slice(0, index),
  newItem,
  ...items.slice(index),
];
