/* eslint-disable prettier/prettier */

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', 'InitsController.index')

Route.get('/sobre', async ({ view }) => {
  return view.render('sobre')
})

Route.get('/resetar', async ({ view }) => {
  return view.render('reset_senha')
})

Route.get('/disciplinas', 'DisciplinasController.list').middleware('auth')
Route.get('/disciplinas/:id', 'DisciplinasController.get')
  .middleware('auth')
  .as('disciplinas.get')

Route.get('/perfil', async ({ view }) => {
  return view.render('users/perfil')
}).middleware('auth')

Route.get('/grade', 'DisciplinasCursadasController.listGrade').middleware('auth')

Route.get('/eixos', async ({ view }) => {
  return view.render('eixos')
}).middleware('auth')

Route.get('/alterar', async ({ view }) => {
  return view.render('users/alterar')
}).middleware('auth')

Route.group(() => {
  Route.get('/login', 'AuthController.loginIndex')
  Route.post('/login', 'AuthController.login').as('auth.login')

  Route.get('/cadastro', 'AuthController.registerIndex')
  Route.post('/cadastro', 'AuthController.register').as('auth.register')
  Route.post('/validar', 'AuthController.edit').as('auth.edit')
  Route.post('/validarDisciplinas', 'AuthController.confirm_registration').as('auth.confirm_registration')
  Route.patch('/update', 'AuthController.registerUpdate').as('auth.registerUpdate').middleware('auth')

  Route.get('/logout', 'AuthController.logout').middleware('auth')
})

//disciplinas cursadas
Route.post('/disciplinas/update', 'DisciplinasCursadasController.update').as('disciplina.update')

//Route.get('/teste', 'InitsController.teste')

Route.get('/generateTestData/:id', 'TestDataController.main')

Route.get('/file/:id', 'FilesController.show').as('files.show').middleware('auth')