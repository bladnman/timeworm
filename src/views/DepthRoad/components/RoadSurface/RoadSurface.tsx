import styles from './RoadSurface.module.css';

interface RoadSurfaceProps {
  widthNear: number;
  widthFar: number;
  height: number;
  vanishingY: number;
}

/**
 * Renders the perspective road surface as a trapezoid
 * converging toward a vanishing point.
 */
export const RoadSurface = ({
  widthNear,
  widthFar,
  height,
  vanishingY,
}: RoadSurfaceProps) => {
  // Calculate trapezoid points (bottom-left, bottom-right, top-right, top-left)
  const centerX = widthNear / 2;
  const halfWidthNear = widthNear / 2;
  const halfWidthFar = widthFar / 2;

  // SVG path for the road surface
  const roadPath = `
    M ${centerX - halfWidthNear} ${height}
    L ${centerX + halfWidthNear} ${height}
    L ${centerX + halfWidthFar} ${vanishingY}
    L ${centerX - halfWidthFar} ${vanishingY}
    Z
  `;

  // Lane divider lines (dashed center line)
  const centerLineStart = `${centerX},${height}`;
  const centerLineEnd = `${centerX},${vanishingY}`;

  // Edge lines for the road shoulders
  const leftEdgeStart = `${centerX - halfWidthNear},${height}`;
  const leftEdgeEnd = `${centerX - halfWidthFar},${vanishingY}`;
  const rightEdgeStart = `${centerX + halfWidthNear},${height}`;
  const rightEdgeEnd = `${centerX + halfWidthFar},${vanishingY}`;

  // Generate perspective grid lines across the road
  const gridLines: { y1: number; y2: number; x1Left: number; x1Right: number; x2Left: number; x2Right: number }[] = [];
  const numGridLines = 20;

  for (let i = 0; i <= numGridLines; i++) {
    const t = i / numGridLines;
    // Use quadratic easing for perspective effect
    const curvedT = Math.pow(t, 0.7);

    const y = height - curvedT * (height - vanishingY);
    const widthAtY = widthNear - (widthNear - widthFar) * curvedT;
    const halfWidth = widthAtY / 2;

    gridLines.push({
      y1: y,
      y2: y,
      x1Left: centerX - halfWidth,
      x1Right: centerX + halfWidth,
      x2Left: centerX - halfWidth,
      x2Right: centerX + halfWidth,
    });
  }

  return (
    <svg
      className={styles.roadSvg}
      viewBox={`0 0 ${widthNear} ${height}`}
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        {/* Gradient for road surface - darker at distance */}
        <linearGradient id="roadGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="var(--color-bg-surface)" />
          <stop offset="80%" stopColor="var(--color-bg-canvas)" />
          <stop offset="100%" stopColor="#0a0f1a" />
        </linearGradient>

        {/* Fade gradient for atmospheric perspective */}
        <linearGradient id="fadeGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="var(--color-border)" stopOpacity="0.8" />
          <stop offset="50%" stopColor="var(--color-border)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--color-border)" stopOpacity="0.1" />
        </linearGradient>

        {/* Glow at vanishing point */}
        <radialGradient id="vanishingGlow" cx="50%" cy="0%" r="30%">
          <stop offset="0%" stopColor="var(--color-text-accent)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--color-text-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background glow at vanishing point */}
      <ellipse
        cx={centerX}
        cy={vanishingY}
        rx={widthNear * 0.3}
        ry={height * 0.15}
        fill="url(#vanishingGlow)"
      />

      {/* Main road surface */}
      <path d={roadPath} fill="url(#roadGradient)" className={styles.roadPath} />

      {/* Perspective grid lines */}
      {gridLines.map((line, i) => (
        <line
          key={`grid-${i}`}
          x1={line.x1Left}
          y1={line.y1}
          x2={line.x1Right}
          y2={line.y2}
          stroke="var(--color-border)"
          strokeWidth={i % 5 === 0 ? 1 : 0.5}
          opacity={0.3 - (i / numGridLines) * 0.25}
        />
      ))}

      {/* Road edge lines */}
      <line
        x1={leftEdgeStart.split(',')[0]}
        y1={leftEdgeStart.split(',')[1]}
        x2={leftEdgeEnd.split(',')[0]}
        y2={leftEdgeEnd.split(',')[1]}
        stroke="url(#fadeGradient)"
        strokeWidth="2"
      />
      <line
        x1={rightEdgeStart.split(',')[0]}
        y1={rightEdgeStart.split(',')[1]}
        x2={rightEdgeEnd.split(',')[0]}
        y2={rightEdgeEnd.split(',')[1]}
        stroke="url(#fadeGradient)"
        strokeWidth="2"
      />

      {/* Center lane divider (dashed) */}
      <line
        x1={centerLineStart.split(',')[0]}
        y1={centerLineStart.split(',')[1]}
        x2={centerLineEnd.split(',')[0]}
        y2={centerLineEnd.split(',')[1]}
        stroke="url(#fadeGradient)"
        strokeWidth="2"
        strokeDasharray="20 15"
      />
    </svg>
  );
};
