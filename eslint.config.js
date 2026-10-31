const fs = require('node:fs');
const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// Layers: app -> features -> shared, one way. A feature is entered only through its index.ts.
const features = fs.existsSync('src/features') ? fs.readdirSync('src/features') : [];

module.exports = defineConfig([
  globalIgnores(['dist/*', '.expo/*', 'ios/*', 'android/*']),
  expoConfig,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/shared',
              from: ['./src/features', './src/app'],
              message: 'shared must not import features or app.',
            },
            {
              target: './src/features',
              from: './src/app',
              message: 'features must not import app.',
            },
            ...features.map((name) => ({
              target: [`./src/features/!(${name})/**/*`, './src/app'],
              from: `./src/features/${name}`,
              except: ['./index.ts'],
              message: `Import ${name} through its index.ts only.`,
            })),
          ],
        },
      ],
    },
  },
]);
