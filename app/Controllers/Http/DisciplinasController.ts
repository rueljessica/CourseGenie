/* eslint-disable prettier/prettier */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Disciplina from 'App/Models/Disciplina'

export default class DisciplinasController {
    public async list({ view, response }: HttpContextContract) {
        try {
            const list = await Disciplina.all()
            return view.render('disciplinas/disciplinas', { disciplinas: list })
        } catch (error) {
            return response.badRequest('Error')
        }
    }

    public async get({ request, response, view }: HttpContextContract) {
        try {
            const body = request.only(['disc'])
            var codigo = body.disc

            const disciplina = await Disciplina.query()
            .where('codigo', codigo)
            .preload('preRequisitos', (preRequisito) => {
                preRequisito.select(['id', 'nome', 'codigo']);
            })
            .preload('conteudoProgramaticos', (conteudo) => {
                conteudo.select(['id', 'unidade', 'topicos']);
            })
            .first();

            return view.render('disciplinas/disciplina', { disciplina: disciplina })

        } catch (error) {
            return response.badRequest('Error' + error)
        }
    }
}