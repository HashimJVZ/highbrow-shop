import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { colors: { ink: '#17191c', muted: '#6c7178', paper: '#f7f7f5', line: '#e8e8e4', lime: '#d6f36a' }, fontFamily: { sans: ['Arial','Helvetica','sans-serif'] } } }, plugins: [] };
export default config;
