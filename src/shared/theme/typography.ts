import type { TextStyle } from 'react-native';

export const typography = {
  headerTitle: { fontSize: 22, fontWeight: '600' },
  segment: { fontSize: 15, fontWeight: '500' },
  segmentActive: { fontSize: 15, fontWeight: '600' },
  cardTitle: { fontSize: 18, fontWeight: '600' },
  subtitle: { fontSize: 13, fontWeight: '400' },
  city: { fontSize: 13, fontWeight: '400' },
  time: { fontSize: 31, fontWeight: '700', letterSpacing: -0.5 },
  caption: { fontSize: 12, fontWeight: '400' },
  button: { fontSize: 18, fontWeight: '600' },
  chip: { fontSize: 15, fontWeight: '600' },
  sectionHeading: { fontSize: 15, fontWeight: '600' },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  tabLabel: { fontSize: 12, fontWeight: '500' },
  gridLabel: { fontSize: 12, fontWeight: '500' },
  seatGlyph: { fontSize: 22, fontWeight: '700' },
} satisfies Record<string, TextStyle>;
