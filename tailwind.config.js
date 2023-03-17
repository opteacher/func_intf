/** @type {import('tailwindcss').Config} */
const base = require('./lib/tailwind.config')
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
  plugins: []
}
