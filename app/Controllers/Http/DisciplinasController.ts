/* eslint-disable prettier/prettier */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Disciplina from 'App/Models/Disciplina'
import Unidade from 'App/Models/Unidade'

export default class DisciplinasController {
    public async list({ view, response }: HttpContextContract) {
        try {
            const list = await Disciplina.all()
            return view.render('disciplinas', { disciplinas: list })
        } catch (error) {
            return response.badRequest('Error')
        }
    }

    public async get({ request, response, view }: HttpContextContract) {
        try {
            const body = request.only(['disc'])
            var codigo = body.disc

            const disciplina = await Disciplina
                .query()
                .where('codigo', codigo)
                .first()
            const unidades = await Unidade
            .query()
            .where('disciplina_id', disciplina?.id)

            const item = {
                nome: disciplina?.nome,
                codigo: disciplina?.codigo,
                unidades: unidades
            }

            console.log(item)

            return view.render('teste', { item: item})

        } catch (error) {
            return response.badRequest('Error')
        }
    }
}