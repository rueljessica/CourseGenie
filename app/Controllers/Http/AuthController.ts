/* eslint-disable prettier/prettier */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import ParsePDF from 'App/Helpers/ParsePDF'
import Hash from '@ioc:Adonis/Core/Hash'
import Application from '@ioc:Adonis/Core/Application'
import DisciplinasCursadaController from 'App/Controllers/Http/DisciplinasCursadasController'
import DisciplinasCursada from 'App/Models/DisciplinasCursada'
import Disciplina from 'App/Models/Disciplina'

const disciplinasCursadas = new DisciplinasCursadaController();

export default class AuthController {
    public async loginIndex({ view }: HttpContextContract) {
        return view.render('users/login')
    }

    public async login({ request, response, auth, session }: HttpContextContract) {
        const { email, password } = request.all()
        const userDate = User.findBy('email', email)

        if (!userDate) {
            session.flash('notification', 'Email ou senha inválidos.')
            return response.redirect('back')
        }

        try {
            await auth.use('web').attempt(email, password)
            return response.redirect("/")
        } catch (error) {
            session.flash('notification', 'Email ou senha inválidos.')
            return response.redirect('back')
        }
    }

    public async registerIndex({ view }: HttpContextContract) {
        return view.render('users/cadastro')
    }

    public async register({ auth, request, response, view }: HttpContextContract) {
        const user = new User();
        user.name = request.input('name');
        user.email = request.input('email');
        user.password = request.input('password');

        //avatar
        const avatar = request.file('avatar')
        if (!avatar) {
            return response.badRequest('Please upload file')
        }
        const imageName = new Date().getTime().toString() + `.${avatar.extname}`
        await avatar?.move(Application.publicPath('imgs'), {
            name: imageName
        })

        user.avatar = `${imageName}`

        //historico
        const historico = request.file('historico')
        if (!historico) {
            return response.badRequest('Please upload file')
        }
        const fileName = new Date().getTime().toString() + `.${historico.extname}`
        await historico?.move(Application.publicPath('historicos'), {
            name: fileName
        })

        user.historico = `${fileName}`

        var parse = new ParsePDF();
        var json = await parse.read(Application.publicPath('historicos') + "/" + fileName)

        user.nomeCompleto = json.nome
        user.nacionalidade = json.nacionalidade
        user.rg = json.rg
        user.cpf = json.cpf
        user.dataNascimento = json.dataNascimento
        user.prazoConclusao = json.prazoConclusao
        user.status = json.status
        user.ira = json.ira
        user.anoLetivo = json.anoLetivo
        user.matricula = json.matricula

        await user.save();
        await disciplinasCursadas.store(user, json.disciplinas)
        await auth.use('web').attempt(user.email, request.input('password'))

        return view.render('users/editar_dadosPessoais', { user: user })
    }

    public async edit({ auth, request, response, view }: HttpContextContract) {
        try {
            const user = await User
                .query()
                .where('email', auth.user?.email)
                .update({
                    name: request.input('name'),
                    email: request.input('email'),
                    matricula: request.input('matricula'),
                    nacionalidade: request.input('nacionalidade'),
                    rg: request.input('rg'),
                    cpf: request.input('cpf'),
                    dataNascimento: request.input('dataNascimento'),
                    prazoConclusao: request.input('prazoConclusao'),
                    status: request.input('status'),
                    ira: request.input('ira'),
                    anoLetivo: request.input('anoLetivo')
                })

            const disciplinasCurs = await disciplinasCursadas.list(auth);
            const disciplinas = await Disciplina
                .query()

            return view.render('users/editar_dadosHistorico', { disciplinas: disciplinas, disciplinasCursadas: disciplinasCurs })
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    public async registerUpdate({ auth, request, response }: HttpContextContract) {
        try {
            var password = await Hash.make(request.input('password'))
            await User
                .query()
                .where('email', auth.user?.email)
                .update({ password: password })

            response.ok('Senha alterada com sucesso!') // criar pg/pop para alterado com sucesso
        } catch (error) {
            response.badRequest('Não foi possível executar a alteração de senha' + error.messages) // criar pg/pop para falha na alteração
        }
    }

    public async logout({ auth, response }: HttpContextContract) {
        await auth.use('web').logout()
        return response.redirect('/')
    }

    public async get({ auth, view }: HttpContextContract) {

        const disciplinas = await DisciplinasCursada
            .query()
            .where('user_id', auth.user?.id)

        // eslint-disable-next-line @typescript-eslint/naming-convention
        const _ = require('lodash');

        const situacoesApr = ['CUMPRIU', 'APR', 'APRN', 'INCORP', 'CUMP'];
        const disciplinasApr = disciplinas.filter(disciplina => situacoesApr.includes(disciplina.situacao));

        const obApr = disciplinasApr.filter(a => a.tipo !== 'EQUIVALENTE' && a.tipo !== null);
        const eqApr = disciplinasApr.filter(a => a.tipo === 'EQUIVALENTE');

        const codigoDisciplinas = obApr.map((disciplina) => disciplina.codigo);
        const idDisciplinas = eqApr.map((disciplina) => disciplina.equivalenciaId);

        const listDisciplinasCod = await Disciplina
            .query()
            .whereIn('codigo', codigoDisciplinas)

        const listDisciplinasId = await Disciplina
            .query()
            .whereIn('id', idDisciplinas);

        const mappedDisciplinas = [
            ...obApr.map((disciplina) => {
                const infoCargaHoraria = _.find(listDisciplinasCod, { codigo: disciplina.codigo });

                return {
                    tipo: disciplina.tipo,
                    disciplina: disciplina.nome,
                    codigo: disciplina.codigo,
                    cargaHoraria: infoCargaHoraria ? infoCargaHoraria.cargaHoraria : null,
                };
            }),
            ...eqApr.map((disciplina) => {
                const infoCargaHoraria = _.find(listDisciplinasId, { id: disciplina.equivalenciaId });

                return {
                    tipo: infoCargaHoraria.periodo,
                    disciplina: disciplina.nome,
                    codigo: disciplina.codigo,
                    cargaHoraria: infoCargaHoraria ? infoCargaHoraria.cargaHoraria : null,
                };
            })
        ];

        let cargaHorariaObrigatoriaTotal = 0;
        let cargaHorariaOptativaTotal = 0;

        mappedDisciplinas.forEach((disciplina) => {
            // Verificando o tipo da disciplina
            if (disciplina.tipo === 'OPTATIVA' || disciplina.tipo === -1) {
                cargaHorariaOptativaTotal += disciplina.cargaHoraria || 0;
            }else if (disciplina.codigo === 'TM422' || disciplina.codigo === 'TM404') {
                cargaHorariaObrigatoriaTotal += 60;
            }
            else {
                cargaHorariaObrigatoriaTotal += disciplina.cargaHoraria || 0;
            }
        });

        // Calculando a carga horária pendente para cada tipo
        const cargaHorariaObrigatoriaPendente = Math.max(2280 - cargaHorariaObrigatoriaTotal, 0);
        const cargaHorariaOptativaPendente = Math.max(720 - cargaHorariaOptativaTotal, 0);

        console.log('Carga Horária Obrigatória Pendente:', cargaHorariaObrigatoriaPendente);
        console.log('Carga Horária Optativa Pendente:', cargaHorariaOptativaPendente);

        return view.render('users/perfil', { disciplinas: disciplinas, cargaHorariaObrigatoriaPendente: cargaHorariaObrigatoriaPendente, cargaHorariaOptativaPendente: cargaHorariaOptativaPendente })
    }
}