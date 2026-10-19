type SparklineProps = {
  /** Les points dans l'ordre chronologique ; `value` entre 0 et 1. */
  points: { label: string; value: number; text: string }[];
  /** Description lue par les lecteurs d'écran : « Évolution du taux de réussite de 2023 à 2026 ». */
  label: string;
  /** Couleur du dernier point, le seul mis en avant. */
  accent: string;
};

const WIDTH = 160;
const HEIGHT = 44;
const PAD_X = 8;
const PAD_Y = 8;

/**
 * Petite courbe d'évolution. La ligne est grise pour rester en retrait ; seul le dernier point
 * prend la couleur de la section. Chaque point affiche sa valeur au survol.
 */
export function Sparkline({ points, label, accent }: SparklineProps) {
  if (points.length < 2) return null;

  const values = points.map((point) => point.value);
  // Fenêtre d'au moins 20 points de pourcentage, pour ne pas exagérer une petite variation.
  const mid = (Math.max(...values) + Math.min(...values)) / 2;
  const half = Math.max((Math.max(...values) - Math.min(...values)) / 2 + 0.03, 0.1);
  const low = Math.max(0, Math.min(mid - half, 1 - 2 * half));
  const high = Math.min(1, low + 2 * half);

  const x = (index: number) => PAD_X + (index * (WIDTH - 2 * PAD_X)) / (points.length - 1);
  const y = (value: number) => HEIGHT - PAD_Y - ((value - low) / (high - low)) * (HEIGHT - 2 * PAD_Y);
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)} ${y(point.value).toFixed(1)}`).join(' ');
  const last = points.length - 1;

  return (
    <figure className="flex flex-col gap-1">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={label} className="h-11 w-full max-w-40 overflow-visible">
        <path d={path} fill="none" stroke="#6b7896" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => (
          <g key={point.label}>
            {index === last ? <circle cx={x(index)} cy={y(point.value)} r="5" fill={accent} stroke="#ffffff" strokeWidth="2" /> : null}
            {/* Zone de survol plus large que le point, avec la valeur en infobulle. */}
            <circle cx={x(index)} cy={y(point.value)} r="12" fill="transparent">
              <title>{`${point.label} · ${point.text}`}</title>
            </circle>
          </g>
        ))}
      </svg>
      <figcaption aria-hidden="true" className="flex max-w-40 justify-between text-xs leading-4 text-muted tabular-nums">
        <span>{points[0].label}</span>
        <span>{points[last].label}</span>
      </figcaption>
    </figure>
  );
}
