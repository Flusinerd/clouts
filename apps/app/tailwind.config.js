const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#B04EB4',
          shade: '#9B459E',
          tint: 'B860BC',
        },
        secondary: {
          DEFAULT: '#8135ba',
          shade: '#722fa4',
          tint: '#8e49c1',
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
