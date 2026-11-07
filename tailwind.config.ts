import type { Config } from 'tailwindcss';

import { colors } from './src/shared/theme/colors';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  // nativewind/preset ships a CommonJS preset without a module type declaration.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  presets: [require('nativewind/preset')],
  theme: { extend: { colors } },
  plugins: [],
} satisfies Config;
