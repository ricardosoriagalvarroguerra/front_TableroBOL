import { useTheme } from '../../theme';

interface DonutDatum {
  v: number;
  color: string;
}

interface DonutProps {
  data: DonutDatum[];
  size?: number;
}

export function Donut({ data, size = 64 }: DonutProps) {
  const theme = useTheme();
  const total = data.reduce((s, d) => s + d.v, 0);
  const r = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;
  let acc = 0;
  const stroke = size / 8;

  return (
    <svg key={theme} width={size} height={size} className="block">
      {data.map((d, i) => {
        const start = (acc / total) * Math.PI * 2;
        acc += d.v;
        const end = (acc / total) * Math.PI * 2;
        const x1 = cx + r * Math.sin(start);
        const y1 = cy - r * Math.cos(start);
        const x2 = cx + r * Math.sin(end);
        const y2 = cy - r * Math.cos(end);
        const large = end - start > Math.PI ? 1 : 0;
        return (
          <path
            key={i}
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
            strokeWidth={stroke}
            style={{ stroke: d.color, fill: 'none' }}
          />
        );
      })}
    </svg>
  );
}
