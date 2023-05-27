/* eslint-disable prettier/prettier */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import Application from '@ioc:Adonis/Core/Application'

export default class AuthController {
    public async loginIndex({ view }: HttpContextContract) {
        return view.render('login')
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
        return view.render('register')
    }


    public async register({ request, response }: HttpContextContract) {
        const newUserSchema = await request.validate({
            schema: schema.create({
                name: schema.string(),
                email: schema.string([
                    rules.email(),
                    rules.unique({ table: 'users', column: 'email' })
                ]),
                password: schema.string([
                    rules.minLength(4)
                ]),
                registration: schema.string([
                    rules.unique({ table: 'users', column: 'registration' })
                ])
            }),
            messages: {
                "email.unique": "Esse e-mail já está sendo utilizado.",
                required: "Esse campo é obrigatório",
                "password.minLength": "Sua senha precisa ter no mínimo 4 caracteres."
            },
        })

        try {
            const user = await User.create(newUserSchema)
            const avatar = request.file('avatar')
            if (!avatar) {
                return response.badRequest('Please upload file')
            }
            const imageName = new Date().getTime().toString() + `.${avatar.extname}`
            await avatar?.move(Application.publicPath('imgs'), {
                name: imageName
            })

            user.avatar = `imgs/${imageName}`
            await user.save();

            return response.redirect('/login')
        } catch (error) {
            return response.badRequest(error.messages)
        }
    }

    public async registerUpdate({ auth, request, response }: HttpContextContract) {
        try {
            if (request.input('name')) {
                await User
                    .query()
                    .where('email', auth.user?.email)
                    .update({ name: request.input('name') })
            } else
            if (request.input('password') && request.input('password_confirmation')) {
                if (request.input('password') === request.input('password_confirmation')) {
                    var password = await Hash.make(request.input('password'))

                    await User
                        .query()
                        .where('email', auth.user?.email)
                        .update({ password: password })
                }
                else{
                    return response.badRequest('Senhas diferentes!') // criar pg/pop senhas diferentes
                }
            } else
            if (request.file('avatar')) {
                const user = auth.user
                const avatar = request.file('avatar')
                const imageName = new Date().getTime().toString() + `.${avatar.extname}`

                await avatar?.move(Application.publicPath('imgs'), {
                    name: imageName
                })

                user.avatar = `imgs/${imageName}`
                user?.save()
            } else {
                return response.badRequest('Erro ao carregar a imagem!') // criar pg/pop senhas diferentes
            }
            return response.ok('Alterado com sucesso!') // criar pg/pop para alterado com sucesso
        } catch (error) {
            return response.badRequest('Não foi possível executar a alteração' + error.messages) // criar pg/pop para falha na alteração
        }
    }

    public async logout({ auth, response }: HttpContextContract) {
        await auth.use('web').logout()
        return response.redirect('/')
    }
}
