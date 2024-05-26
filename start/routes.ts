/* eslint-disable prettier/prettier */
import Route from '@ioc:Adonis/Core/Route'

// Auth Routes
Route.get('/login', async ({ view }) => { return view.render('users/login') })
Route.get('/cadastro', async ({ view }) => { return view.render('users/cadastro') })
Route.post('/login', 'AuthController.login').as('auth.login')
Route.post('/cadastro', 'AuthController.register').as('auth.register')
// Middleware Auth Group
Route.group(() => {
  Route.get('/logout', async ({ auth, response }) => {
    await auth.use('web').logout()
    return response.redirect('/')
  })
  Route.get('/alterar-senha', async ({ view }) => { return view.render('users/reset_senha') })
  Route.get('/perfil', 'AuthController.show')

  // As Auth Group
  Route.group(() => {
    Route.get('/alterar', async ({ auth, view }) => { return view.render('users/editar_dadosPessoais', { user: auth.user }) }).as('get')
    Route.post('/validar', 'AuthController.validate').as('validate')
    Route.post('/alterar', 'AuthController.update').as('edit')
    Route.patch('/update', 'AuthController.registerUpdate').as('registerUpdate')
    Route.delete('/cadastro', 'AuthController.destroy').as('destroy')
  }).as('auth')
}).middleware('auth')

// Disciplinas Cursadas Routes
Route.group(() => {
  Route.get('/grade', 'DisciplinasCursadasController.showGrade')
  Route.get('/eixos', 'DisciplinasCursadasController.showEixos')

  // As Disciplinas Cursadas Group
  Route.group(() => {
    Route.post('/disciplinas/update', 'DisciplinasCursadasController.update').as('update')
    Route.post('/disciplinas/create', 'DisciplinasCursadasController.create').as('create')
    Route.delete('/disciplinas/:id', 'DisciplinasCursadasController.destroy').as('destroy')
    Route.get('/alterar-historico', 'DisciplinasCursadasController.historicoUpdate').as('historicoUpdate')
  }).as('disciplina')
}).middleware('auth')

// Disciplinas Routes
Route.get('/disciplinas', 'DisciplinasController.list').middleware('auth')
Route.get('/disciplinas/:id', 'DisciplinasController.get').middleware('auth').as('disciplinas.get')

var turma = {
  codigo: "TN716",
  nome: "MODELAGEM E PROJETO DE SOFTWARE",
  ano: "2024",
  periodo: "1",
  turma: "01",
  professor: "FELLIPE RIBEIRO DUARTE",
  horario: [
    "3T34", "6T34"
  ],
  local: "Bloco Multimídia - Sala 210 - Terça Horários 14:00 às 15:00Bloco Multimídia - Sala 210 - Terça Horários 15:00 às 16:00Bloco Multimídia - Sala 210 - Sexta Horários 14:00 às 15:00Bloco Multimídia - Sala 210 - Sexta Horários 15:00 às 16:00",
  capacidade: 50
};

Route.group(() => {
  Route.get('/primeiro-periodo', async ({ view }) => { return view.render('disciplinas/periodos/periodo_um') })
  Route.get('/segundo-periodo', async ({ view }) => { return view.render('disciplinas/periodos/periodo_dois') })
  Route.get('/terceiro-periodo', async ({ view }) => { return view.render('disciplinas/periodos/periodo_tres') })
  Route.get('/quarto-periodo', async ({ view }) => { return view.render('disciplinas/periodos/periodo_quatro') })
  Route.get('/quinto-periodo', async ({ view }) => { return view.render('disciplinas/periodos/periodo_cinco') })
  Route.get('/sexto-periodo', async ({ view }) => { return view.render('disciplinas/periodos/periodo_seis') })
  Route.get('/optativas', async ({ view }) => { return view.render('disciplinas/optativas') })
  Route.get('/recomendacao', async ({ view }) => { return view.render('disciplinas/recomendacao', { turma }) })
}).middleware('auth')

// Professors Routes
Route.get('/professores', 'ProfessorsController.list').middleware('auth')
Route.get('/professores/:id', 'ProfessorsController.get').middleware('auth')


// Salva as informações dos jsons no banco 
Route.get('/', 'InitsController.index')

Route.get('sobre', async ({ view }) => { return view.render('home/sobre') })

// Rota para gerar usuários e disciplinas cursadas
Route.get('/generateTestData/:id', 'TestDataController.index')

// Rota para manipulação da imagem de perfil
Route.get('/file/:id', 'FilesController.show').as('files.show').middleware('auth')

/*
Route.get('/esqueci-senha', async ({ view }) => {
  return view.render('users/esqueci_senha')
})* O QUE FAZER??*/ 

