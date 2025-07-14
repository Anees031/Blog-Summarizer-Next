/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-import': {},
    'tailwindcss/nesting': {},
  },
}

module.exports = config 