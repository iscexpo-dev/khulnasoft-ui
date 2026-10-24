export const DEFAULT_COUNT = 168;
export const MIN_AUTO_COUNT = 36;
export const AREA_EXPONENT = 0.4;
export const DEFAULT_DURATION = 3000;
export const FADE_OUT_DURATION = 600;
export const CANVAS_Z_INDEX = 9999;
export const MAX_FRAME_DELTA = 50;

export const EDGE_ANGLE = (54 * Math.PI) / 180;
export const POINT_ANGLE = Math.PI / 2;
export const POINT_POWER = 0.8;
export const MIN_REACH = 0.04;
export const REACH_HEADROOM = 1.3;

export const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export const CONFIG = {
  burstWindow: 220,
  edgeSpread: 46,
  pointSpread: 75,
  aimJitter: 5,
  drag: 0.0022,
  gravity: 0.0005,
  cell: 10,
  fringeCells: 2,
  blobCells: 1.4,
  blobCellRange: 2,
  stretch: 1.6,
  stretchRange: 1.4,
  peak: 0.55,
  peakRange: 0.45,
  falloff: 1.3,
  decayMin: 0.45,
  pixelFloor: 0.5,
  pixelFade: 0.6,
  pixelMin: 2,
};
