import { CONFIG, BAYER } from './constants';
import { FRINGE_KEYS } from './palette';

const SPAN = BAYER.length;
const LEVELS = SPAN * SPAN;

export const createField = ({ ramp, duration }) => {
  const last = ramp.length - 1;

  let columns = 0;
  let rows = 0;
  let coverage = new Float32Array(0);
  let sizes = new Float32Array(0);
  let fromColumn = 0;
  let toColumn = -1;
  let fromRow = 0;
  let toRow = -1;

  const valueAt = (column, row) =>
    column < 0 || column >= columns ? 0 : coverage[row * columns + column];

  const thresholdAt = (column, row) => BAYER[row % SPAN][column % SPAN] / LEVELS;

  const fringeKey = (column, row, threshold) =>
    (valueAt(column - CONFIG.fringeCells, row) > threshold ? 1 : 0) +
    (valueAt(column, row) > threshold ? 2 : 0) +
    (valueAt(column + CONFIG.fringeCells, row) > threshold ? 4 : 0);

  const fringeColor = (column, row, threshold) => {
    const index = FRINGE_KEYS[fringeKey(column, row, threshold)];

    return index === null ? null : ramp[Math.min(last, index)];
  };

  const coverageColor = (value) => ramp[Math.min(last, Math.floor(value * ramp.length))];

  const pixelSize = (index) => Math.max(CONFIG.pixelMin, Math.round(CONFIG.cell * sizes[index]));

  const resize = (stage) => {
    const nextColumns = Math.ceil(stage.width / CONFIG.cell) + 1;
    const nextRows = Math.ceil(stage.height / CONFIG.cell) + 1;

    if (nextColumns !== columns || nextRows !== rows) {
      columns = nextColumns;
      rows = nextRows;
      coverage = new Float32Array(columns * rows);
      sizes = new Float32Array(columns * rows);
    } else {
      coverage.fill(0);
    }

    fromColumn = columns;
    toColumn = -1;
    fromRow = rows;
    toRow = -1;
  };

  const stamp = (piece, elapsed) => {
    const age = (elapsed - piece.delay) / (duration * piece.decayFrom);
    const strength = piece.peak * Math.max(0, 1 - age);

    if (strength <= 0) {
      return;
    }

    const fade = 1 - CONFIG.pixelFade * age;
    const near = CONFIG.pixelFloor + piece.depth * (1 - CONFIG.pixelFloor);
    const size = near * fade;
    const radius = piece.radius * fade;
    const { stretch } = piece;
    const centerX = piece.x / CONFIG.cell;
    const centerY = piece.y / CONFIG.cell;
    const speed = Math.hypot(piece.velocityX, piece.velocityY) || 1;
    const alongX = piece.velocityX / speed;
    const alongY = piece.velocityY / speed;
    const reach = radius * stretch;
    const fromX = Math.max(0, Math.ceil(centerX - reach));
    const toX = Math.min(columns - 1, Math.floor(centerX + reach));
    const fromY = Math.max(0, Math.ceil(centerY - reach));
    const toY = Math.min(rows - 1, Math.floor(centerY + reach));

    fromColumn = Math.min(fromColumn, fromX);
    toColumn = Math.max(toColumn, toX);
    fromRow = Math.min(fromRow, fromY);
    toRow = Math.max(toRow, toY);

    for (let row = fromY; row <= toY; row += 1) {
      const deltaY = row - centerY;

      for (let column = fromX; column <= toX; column += 1) {
        const deltaX = column - centerX;
        const along = (deltaX * alongX + deltaY * alongY) / stretch;
        const across = deltaX * alongY - deltaY * alongX;
        const distance = Math.hypot(along, across) / radius;

        if (distance < 1) {
          const index = row * columns + column;
          const value = strength * (1 - distance) ** CONFIG.falloff;

          if (value > coverage[index]) {
            coverage[index] = value;
            sizes[index] = size;
          }
        }
      }
    }
  };

  const paint = (drawBlock) => {
    for (let row = fromRow; row <= toRow; row += 1) {
      for (let column = fromColumn; column <= toColumn; column += 1) {
        const index = row * columns + column;
        const threshold = thresholdAt(column, row);
        const value = coverage[index];

        if (value <= threshold) {
          continue;
        }

        const size = pixelSize(index);
        const inset = Math.round((CONFIG.cell - size) / 2);

        drawBlock({
          x: column * CONFIG.cell + inset,
          y: row * CONFIG.cell + inset,
          size,
          color: fringeColor(column, row, threshold) ?? coverageColor(value),
        });
      }
    }
  };

  return { resize, stamp, paint };
};
