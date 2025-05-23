/** @type {import('tailwindcss').Config} */
const base = require('./lib/tailwind.config')
const plugin = require('tailwindcss/plugin')
module.exports = {
  corePlugins: {
    preflight: false
  },
  important: true,
  content: ['./lib/src/**/*.{vue,ts}', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      textColor: theme => ({
        ...base.theme.textColor(theme)
      }),
      backgroundColor: theme => ({
        ...base.theme.backgroundColor(theme)
      }),
      borderColor: theme => ({
        ...base.theme.borderColor(theme)
      })
    }
  },
  plugins: [
    plugin(function({ addBase, theme }) {
      addBase({
        'h1': { fontSize: theme('fontSize.2xl') },
        'h2': { fontSize: theme('fontSize.xl') },
        'h3': { fontSize: theme('fontSize.lg') },
      })
    })
  ]
}
