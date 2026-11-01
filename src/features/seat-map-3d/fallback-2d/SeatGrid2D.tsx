import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, layout, radius, typography } from '@/shared/theme';

import { seatVisual, type SeatVisual } from '../seatVisual';
import type { SeatInfo, SeatMapProps } from '../types';

const COLUMNS = ['A', 'B', 'C', 'D', 'E'];
const AISLE_AFTER = 'C';
// Rows use `gap: layout.seatGap`, which already adds a gap on each side of the spacer.
const AISLE_SPACER = layout.aisleGap - 2 * layout.seatGap;

// State is never colour alone: taken seats carry a cross, the selected seat a check,
// the pending seat a spinner (and the ARIA state below).
function Seat({
  seat,
  visual,
  onPress,
}: {
  seat: SeatInfo;
  visual: SeatVisual;
  onPress: () => void;
}) {
  const taken = visual === 'taken';
  return (
    <Pressable
      role="button"
      aria-label={`Seat ${seat.code}`}
      aria-busy={visual === 'pending'}
      aria-selected={visual === 'selected'}
      aria-disabled={taken}
      disabled={taken}
      onPress={onPress}
      style={[styles.seat, seatStyles[visual]]}
    >
      {taken && (
        <Text style={[typography.seatGlyph, { color: colors.seatTakenGlyph }]}>
          ✕
        </Text>
      )}
      {visual === 'selected' && (
        <Text style={[typography.seatGlyph, { color: colors.onAccent }]}>
          ✓
        </Text>
      )}
      {visual === 'pending' && <ActivityIndicator color={colors.accent} />}
    </Pressable>
  );
}

export function SeatGrid2D({
  layout: seats,
  status,
  selectedSeat,
  pendingSeat,
  onSeatPress,
}: SeatMapProps) {
  const rows = [...new Set(seats.map((seat) => seat.row))].sort(
    (a, b) => a - b,
  );

  return (
    <View style={styles.grid}>
      <View style={[styles.row, styles.headerRow]}>
        <View style={styles.rowLabel} />
        {COLUMNS.flatMap((col) => [
          <Text key={col} style={styles.columnLabel}>
            {col}
          </Text>,
          ...(col === AISLE_AFTER
            ? [<View key="aisle" style={{ width: AISLE_SPACER }} />]
            : []),
        ])}
      </View>
      {rows.map((row) => (
        <View key={row} style={styles.row}>
          <Text style={[styles.rowLabel, styles.label]}>{row}</Text>
          {COLUMNS.flatMap((col) => {
            const seat = seats.find((s) => s.row === row && s.col === col);
            return [
              seat ? (
                <Seat
                  key={col}
                  seat={seat}
                  visual={seatVisual(
                    seat.code,
                    status,
                    selectedSeat,
                    pendingSeat,
                  )}
                  onPress={() => onSeatPress(seat.code)}
                />
              ) : (
                <View key={col} style={styles.seat} />
              ),
              ...(col === AISLE_AFTER
                ? [<View key="aisle" style={{ width: AISLE_SPACER }} />]
                : []),
            ];
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { alignSelf: 'center', gap: layout.seatGap },
  row: { flexDirection: 'row', alignItems: 'center', gap: layout.seatGap },
  headerRow: { height: layout.seatHeaderRow },
  label: { ...typography.gridLabel, color: colors.textInactive },
  rowLabel: { width: layout.seatRowLabel, textAlign: 'center' },
  columnLabel: {
    ...typography.gridLabel,
    color: colors.textInactive,
    width: layout.seatCell,
    textAlign: 'center',
  },
  seat: {
    width: layout.seatCell,
    height: layout.seatCell,
    borderRadius: radius.seat,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const seatStyles = StyleSheet.create({
  free: { backgroundColor: colors.seatFree, borderColor: colors.seatBorder },
  taken: { backgroundColor: colors.seatTaken, borderColor: colors.seatTaken },
  selected: { backgroundColor: colors.accent, borderColor: colors.accent },
  pending: { backgroundColor: colors.seatFree, borderColor: colors.accent },
});
