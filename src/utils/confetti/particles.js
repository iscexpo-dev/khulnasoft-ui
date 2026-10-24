import {
  CONFIG,
  DEFAULT_COUNT,
  MIN_AUTO_COUNT,
  AREA_EXPONENT,
  EDGE_ANGLE,
  POINT_ANGLE,
  POINT_POWER,
  MIN_REACH,
  REACH_HEADROOM,
} from './constants';

const randomBetween = (min, max) => min + Math.random() * (max - min);

const degrees = (value) => (value * Math.PI) / 180;

const aimJitter = () => randomBetween(-degrees(CONFIG.aimJitter), degrees(CONFIG.aimJitter));

const countFor = (stage) => {
  const share = (stage.width * stage.height) / (window.innerWidth * window.innerHeight);

  return Math.round(Math.max(MIN_AUTO_COUNT, DEFAULT_COUNT * share ** AREA_EXPONENT));
};

const launchFromEdges = (stage, index) => {
  const fromLeft = index % 2 === 0;

  return {
    x: fromLeft ? -10 : stage.width + 10,
    y: stage.height + 10,
    aim: Math.max(EDGE_ANGLE, Math.atan2(stage.height, stage.width)),
    spread: degrees(CONFIG.edgeSpread),
    direction: fromLeft ? 1 : -1,
    power: 1,
  };
};

const launchFromPoint = (origin) => ({
  x: origin.x,
  y: origin.y,
  aim: POINT_ANGLE,
  spread: degrees(CONFIG.pointSpread),
  direction: 1,
  power: POINT_POWER,
});

const createPiece = ({ stage, origin, index, jitter, maxSpeed }) => {
  const launch = origin ? launchFromPoint(origin) : launchFromEdges(stage, index);
  const depth = Math.random();
  const reach = Math.sqrt(randomBetween(MIN_REACH, 1));
  const speed = maxSpeed * launch.power * reach * (0.85 + depth * 0.2);
  const angle = launch.aim + jitter + randomBetween(-launch.spread, launch.spread);

  return {
    depth,
    x: launch.x,
    y: launch.y,
    delay: randomBetween(0, CONFIG.burstWindow),
    radius: CONFIG.blobCells + depth * CONFIG.blobCellRange,
    stretch: CONFIG.stretch + Math.random() * CONFIG.stretchRange,
    peak: CONFIG.peak + depth * CONFIG.peakRange,
    decayFrom: randomBetween(CONFIG.decayMin, 1),
    velocityX: Math.cos(angle) * speed * launch.direction,
    velocityY: -Math.sin(angle) * speed,
    swayAmplitude: randomBetween(0.02, 0.08) * (1.3 - depth * 0.5),
    swayFrequency: randomBetween(0.001, 0.003),
    swayPhase: Math.random() * Math.PI * 2,
  };
};

export const createPieces = ({ stage, origin, count }) => {
  const travel = Math.max(Math.hypot(stage.width, stage.height), stage.height * REACH_HEADROOM);
  const maxSpeed = travel * CONFIG.drag;
  const jitter = aimJitter();

  return Array.from({ length: count ?? countFor(stage) }, (value, index) =>
    createPiece({ stage, origin, index, jitter, maxSpeed }),
  );
};

export const advancePiece = (piece, { elapsed, delta }) => {
  if (elapsed < piece.delay) {
    return piece;
  }

  const drag = Math.exp(-CONFIG.drag * delta);
  const velocityX = piece.velocityX * drag;
  const velocityY = (piece.velocityY + CONFIG.gravity * delta) * drag;
  const sway = Math.sin(piece.swayPhase + elapsed * piece.swayFrequency) * piece.swayAmplitude;

  return {
    ...piece,
    velocityX,
    velocityY,
    x: piece.x + (velocityX + sway) * delta,
    y: piece.y + velocityY * delta,
  };
};
