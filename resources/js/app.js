/* eslint-disable prettier/prettier */
import '../css/app.css'
import { Dropdown } from 'flowbite'

//Dark mode
var themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon')
var themeToggleLightIcon = document.getElementById('theme-toggle-light-icon')

//Change the icons inside the button based on previous settings
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
});

//Esqueci senha
const confirmBtn = document.getElementById("confirm-btn")
const password = document.getElementById("password")
const confirmPassword = document.getElementById("confirm-password")

confirmBtn.addEventListener('click', function () {
  // Verifica se o campo de senha está vazio
  if (password.value === "") {
    Toastify({
      text: "Digite uma senha.",
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: "red",
      },
    }).showToast();
    return;
  }

  // Verifica se as senhas são diferentes
  if (password.value !== confirmPassword.value) {
    Toastify({
      text: "As senhas não conferem.",
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: "red",
      },
    }).showToast();
    return;
  }

  // Senhas são iguais
  Toastify({
    text: "Senha alterada com sucesso.",
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: {
      background: "green",
    },
  }).showToast();
});

//Resetar senha
const resetConfirmBtn = document.getElementById("reset-confirm-btn");

resetConfirmBtn.addEventListener('click', function () { 
  if (password.value === "") {
    Toastify({
      text: "Digite uma senha.",
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: "red",
      },
    }).showToast();
    return;
  }
});