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
        choque: '#F83838',
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
        green: {
          '50': '#e6f7e6',
          '100': '#ccf0cc',
          '200': '#b3e8b3',
          '300': '#99e199',
          '400': '#80d980',
          '500': '#66d166',
          '600': '#4dc94d',
          '700': '#33c033',
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

