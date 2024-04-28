/* eslint-disable prettier/prettier */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import ParsePDF from 'App/Helpers/ParsePDF'
import Hash from '@ioc:Adonis/Core/Hash'
import Application from '@ioc:Adonis/Core/Application'
import DisciplinasCursadaController from 'App/Controllers/Http/DisciplinasCursadasController'
import DisciplinasCursada from 'App/Models/DisciplinasCursada'

const disciplinasCursadas = new DisciplinasCursadaController();

export default class AuthController {
    public async login({ request, response, auth, session }: HttpContextContract) {
        const { email, password } = request.all()
        const userDate = User.findBy('email', email)

        if (!userDate) {
            session.flash('notification', 'Email ou senha inválidos.')
            session.flash('toast', 'toast-danger')
            return response.redirect('back')
        }

        try {
            await auth.use('web').attempt(email, password)
            return response.redirect("/")
        } catch (error) {
            session.flash('notification', 'Email ou senha inválidos.')
            session.flash('toast', 'toast-danger')
            return response.redirect('back')
        }
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
        return view.render('users/cadastro_dadosPessoais', { user: user })
    }

    private async edit(auth, request): Promise<void> {
        await User
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
    }

    public async update({ auth, request, response }: HttpContextContract) {
        try {
            this.edit(auth, request)
            return response.redirect().toRoute('disciplina.historicoUpdate');
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    public async validate({ auth, request, response }: HttpContextContract) {
        try {
            this.edit(auth, request)
            return response.redirect().toRoute('disciplina.historicoUpdate');
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    public async registerUpdate({ auth, request, response, session }: HttpContextContract) {
        try {
            var password = await Hash.make(request.input('password'))
            await User
                .query()
                .where('email', auth.user?.email)
                .update({ password: password })

            session.flash('notification', 'Senha alterada com sucesso!')
            session.flash('toast', 'toast-success')
            return response.redirect('back')
        } catch (error) {
            response.badRequest('Não foi possível executar a alteração de senha' + error.messages) // criar pg/pop para falha na alteração
        }
    }

    public async show({ auth, view }: HttpContextContract) {

        const disciplinas = await DisciplinasCursada
            .query()
            .where('user_id', auth.user?.id)


        const disciplinasApr = disciplinas.filter(disciplina => ['CUMPRIU', 'APR', 'APRN', 'INCORP', 'CUMP'].includes(disciplina.situacao));

        let cargaHorariaObrigatoriaTotal = 0;
        let cargaHorariaOptativaTotal = 0;
        let cargaHorariaComplTotal = 0;

        disciplinasApr.forEach((disciplina) => {
            // Verificando o tipo da disciplina
            if (disciplina.tipo === 'OB' || disciplina.tipo === "EQOB") {
                cargaHorariaObrigatoriaTotal += disciplina.cargaHoraria || 0;
            } else if (disciplina.tipo === 'AA') {
                cargaHorariaComplTotal += disciplina.cargaHoraria || 0;
            } else {
                cargaHorariaOptativaTotal += disciplina.cargaHoraria || 0;
            }
        });

        return view.render('users/perfil', { disciplinas: disciplinas, cargaHorariaObrigatoriaTotal: cargaHorariaObrigatoriaTotal, cargaHorariaOptativaTotal: cargaHorariaOptativaTotal, cargaHorariaComplTotal: cargaHorariaComplTotal })
    }

    public async destroy({ auth, response }: HttpContextContract) {
        try {
            const user = await User.findOrFail(auth.user?.id)
            await user.delete()

            return response.status(200)
        } catch (error) {
            return response.status(400).json({ message: 'Erro ao excluir a disciplina cursada', error: error.message })
        }
    }
}