/* eslint-disable prettier/prettier */
/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  darkMode: 'class',

  content: ['./resources/**/*.{edge,js,ts,jsx,tsx,vue}', './node_modules/flowbite/**/*.js'],

  plugins: [require('flowbite/plugin')({charts: true,})],

  theme: {
    extend: {
      colors: {
        violet: '#9a6aff',
        violet: {
          '700': '#A57BFF',
          '800': '#9a6aff',
        },
        blue: '#009999',
        gray: {
          '50': '#f9fafb',
          '100': '#f4f5f7',
          '200': '#e5e7eb',
          '300': '#d5d6d7',
          '400': '#9e9e9e',
          '500': '#707275',
          '600': '#4c4f52',
          '700': '#24262d',
          '800': '#1a1c23',
          '900': '#121317',
        },
      },
    },
    fontFamily: {
      body: [
        'staatliches',
       
      ],
      sans: [
        'staatliches',
          
      ],
    },
  }, 
}

