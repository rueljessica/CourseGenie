/* eslint-disable prettier/prettier */

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async ({ view }) => {
  return view.render('home')
})

Route.get('/sobre', async ({ view }) => {
  return view.render('sobre')
})

Route.get('/perfil', async ({ view }) => {
  return view.render('perfil')
}).middleware('auth')

Route.get('/alterar', async ({ view }) => {
  return view.render('alterar')
}).middleware('auth')

Route.group(() => {
  Route.get('/login', 'AuthController.loginIndex')
  Route.post('/login', 'AuthController.login').as('auth.login')

  Route.get('/cadastro', 'AuthController.registerIndex')
  Route.post('/cadastro', 'AuthController.register').as('auth.register')
  Route.patch('/update', 'AuthController.registerUpdate').as('auth.registerUpdate').middleware('auth')

  Route.get('/logout', 'AuthController.logout').middleware('auth')
})

/*
Route.get('/teste', async ({ view, auth }) => {
  //return view.render('update')
}).middleware('auth')*/