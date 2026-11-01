import { SeatGrid2D } from './fallback-2d/SeatGrid2D';
import type { SeatMapProps } from './types';

// 2D only for now; the 3D branch (toggle, boundary, lazy scene) is step 10.
export function SeatMap(props: SeatMapProps) {
  return <SeatGrid2D {...props} />;
}
