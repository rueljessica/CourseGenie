/* eslint-disable prettier/prettier */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

export default class AuthController {
    public async loginIndex({ view }: HttpContextContract) {
        return view.render('login')
    }

    public async login({ request, response, auth, session}: HttpContextContract) {
        const { email, password } = request.all()
        const userDate = User.findBy('email', email)

        if(!userDate){
            session.flash('notification', 'Email ou senha inválidos.')
            return response.redirect('back')
        }

        try{
            await auth.use('web').attempt(email, password)
            return response.redirect("/")
        }catch (error){
            console.log(error)
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
            }
        })

        try{
            const user = await User.create(newUserSchema)
            return response.redirect('/login')
        }catch (error){
            return response.badRequest(error.messages)
        }
    }

    public async logout({auth, response}: HttpContextContract) {
        await auth.use('web').logout()
        return response.redirect('/')
    }
}
