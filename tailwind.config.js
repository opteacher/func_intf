/** @type {import('tailwindcss').Config} */
const base = require('./lib/tailwind.config')
const plugin = require('tailwindcss/plugin')
module.exports = {
  corePlugins: {
    preflight: false
  },
  important: true,
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}', './lib/**/*.{vue,js,ts,jsx,tsx}'],
  media: false, // or 'media' or 'class'
  theme: {
    extend: {
      ...base.theme.extend,
      backgroundImage: {
        login: 'url(/assets/background.png)'
      },
      lineHeight: {
        '16': '4rem'
      }
    },
    textColor: theme => ({
      ...base.theme.textColor(theme)
    }),
    backgroundColor: theme => ({
      ...base.theme.backgroundColor(theme)
    }),
    borderColor: theme => ({
      ...base.theme.borderColor(theme)
    })
  },
  variants: {
    extend: {}
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
