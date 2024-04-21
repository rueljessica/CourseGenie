/* eslint-disable prettier/prettier */

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', 'InitsController.index')

Route.get('sobre', async ({ view }) => {
  return view.render('home/sobre')
})

Route.get('/esqueci-senha', async ({ view }) => {
  return view.render('users/esqueci_senha')
})

Route.get('/disciplinas', 'DisciplinasController.list').middleware('auth')
Route.get('/disciplinas/:id', 'DisciplinasController.get')
  .middleware('auth')
  .as('disciplinas.get')

Route.get('/perfil', 'AuthController.get').middleware('auth')

Route.get('/grade', 'DisciplinasCursadasController.listGrade').middleware('auth')

Route.get('/eixos', 'DisciplinasCursadasController.listEixos').middleware('auth')

Route.get('/alterar-senha', async ({ view }) => {
  return view.render('users/reset_senha')
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

Route.get('/alterar', async ({ auth, view }) => {
  return view.render('users/editar_dadosPessoais', {user: auth.user})
}).middleware('auth')

Route.get('/generateTestData/:id', 'TestDataController.main')

Route.get('/file/:id', 'FilesController.show').as('files.show').middleware('auth')

Route.get('/primeiro-periodo', async ({ view }) => {
  return view.render('disciplinas/periodos/periodo_um')
}).middleware('auth')

Route.get('/segundo-periodo', async ({ view }) => {
  return view.render('disciplinas/periodos/periodo_dois')
}).middleware('auth')

Route.get('/terceiro-periodo', async ({ view }) => {
  return view.render('disciplinas/periodos/periodo_tres')
}).middleware('auth')

Route.get('/quarto-periodo', async ({ view }) => {
  return view.render('disciplinas/periodos/periodo_quatro')
}).middleware('auth')

Route.get('/quinto-periodo', async ({ view }) => {
  return view.render('disciplinas/periodos/periodo_cinco')
}).middleware('auth')

Route.get('/sexto-periodo', async ({ view }) => {
  return view.render('disciplinas/periodos/periodo_seis')
}).middleware('auth')

Route.get('/optativas', async ({ view }) => {
  return view.render('disciplinas/optativas')
}).middleware('auth')

Route.get('/recomendacao', async ({ view }) => {
  return view.render('disciplinas/recomendacao')
}).middleware('auth')