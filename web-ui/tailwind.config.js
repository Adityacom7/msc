/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14181f',
        muted: '#5b6472',
        paper: '#f7f8fa',
        surface: '#ffffff',
        line: '#d8dce3',
        pending: '#e8a33d',
        inprogress: '#3d7fe8',
        done: '#2fae6e',
        danger: '#d64545',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
