/* eslint-disable prettier/prettier */
import Alpine from 'alpinejs'
import '../css/app.css'
import { Dropdown } from 'flowbite'
import { Accordion } from 'flowbite';

Alpine.start()

// Dark mode
var themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon')
var themeToggleLightIcon = document.getElementById('theme-toggle-light-icon')

// Change the icons inside the button based on previous settings
if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  themeToggleLightIcon.classList.remove('hidden')
} else {
  themeToggleDarkIcon.classList.remove('hidden')
}

var themeToggleBtn = document.getElementById('theme-toggle')

themeToggleBtn.addEventListener('click', function () {
  // toggle icons inside button
  themeToggleDarkIcon.classList.toggle('hidden')
  themeToggleLightIcon.classList.toggle('hidden')

  // if set via local storage previously
  if (localStorage.getItem('color-theme')) {
    if (localStorage.getItem('color-theme') === 'light') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('color-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('color-theme', 'light')
    }

    // if NOT set via local storage previously
  } else {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('color-theme', 'light')
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('color-theme', 'dark')
    }
  }
})

  // Dropdown user menu

  // set the dropdown menu element
  const $targetEl = document.getElementById('dropdownMenu')

  // set the element that trigger the dropdown menu on click
  const $triggerEl = document.getElementById('dropdownButton')



  // Accordion
  const accordion = new Accordion(accordionItems, options);

  // create an array of objects with the id, trigger element (eg. button), and the content element
  const accordionItems = [
  {
    id: 'accordion-example-heading-1',
    triggerEl: document.querySelector('#accordion-example-heading-1'),
    targetEl: document.querySelector('#accordion-example-body-1'),
    active: true
  },
  {
    id: 'accordion-example-heading-2',
    triggerEl: document.querySelector('#accordion-example-heading-2'),
    targetEl: document.querySelector('#accordion-example-body-2'),
    active: false
  },
  {
    id: 'accordion-example-heading-3',
    triggerEl: document.querySelector('#accordion-example-heading-3'),
    targetEl: document.querySelector('#accordion-example-body-3'),
    active: false
  },
  {
    id: 'accordion-example-heading-4',
    triggerEl: document.querySelector('#accordion-example-heading-4'),
    targetEl: document.querySelector('#accordion-example-body-4'),
    active: false
  },
  {
    id: 'accordion-example-heading-5',
    triggerEl: document.querySelector('#accordion-example-heading-5'),
    targetEl: document.querySelector('#accordion-example-body-5'),
    active: false
  },
  {
    id: 'accordion-example-heading-6',
    triggerEl: document.querySelector('#accordion-example-heading-6'),
    targetEl: document.querySelector('#accordion-example-body-6'),
    active: false
  },
  {
    id: 'accordion-example-heading-7',
    triggerEl: document.querySelector('#accordion-example-heading-7'),
    targetEl: document.querySelector('#accordion-example-body-7'),
    active: false
  }
];

  // options with default values
  const options = {
  alwaysOpen: true,
  activeClasses: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white',
  inactiveClasses: 'text-gray-500 dark:text-gray-400',
  onOpen: (item) => {
    console.log('accordion item has been shown');
    console.log(item);
  },
  onClose: (item) => {
    console.log('accordion item has been hidden');
    console.log(item);
  },
  onToggle: (item) => {
    console.log('accordion item has been toggled');
    console.log(item);
  },
};  


