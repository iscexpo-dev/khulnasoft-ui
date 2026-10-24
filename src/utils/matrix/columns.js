import { GLYPHS, CONFIG } from './constants';

const randomBetween = (min, max) => min + Math.random() * (max - min);

const sample = (values) => values[Math.floor(Math.random() * values.length)];

export const glyph = () => sample(GLYPHS);

export const measureGrid = ({ width, height }) => ({
  across: Math.ceil(width / CONFIG.cell),
  rows: Math.ceil(height / CONFIG.cell),
});

export const createColumns = (stage, colors) => {
  const { across, rows } = measureGrid(stage);

  return Array.from({ length: across }, (value, column) => ({
    column,
    rows,
    row: -randomBetween(0, CONFIG.startSpread),
    speed: randomBetween(CONFIG.minSpeed, CONFIG.maxSpeed),
    color: sample(colors),
    head: null,
    steps: [],
  })).filter(() => Math.random() < CONFIG.columnShare);
};

export const advanceColumn = (column, delta) => {
  if (column.row > column.rows + CONFIG.restartAfter) {
    return {
      ...column,
      row: -randomBetween(0, CONFIG.restartSpread),
      head: null,
      steps: [],
    };
  }

  const row = column.row + column.speed * delta;
  const from = Math.max(0, Math.ceil(column.row));
  const to = Math.min(column.rows, Math.floor(row));
  const steps = [];

  for (let step = from; step <= to; step += 1) {
    steps.push(step);
  }

  return {
    ...column,
    row,
    head: steps.length ? steps.at(-1) : column.head,
    steps,
  };
};
