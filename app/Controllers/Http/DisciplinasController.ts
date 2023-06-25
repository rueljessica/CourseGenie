/* eslint-disable prettier/prettier */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Disciplina from 'App/Models/Disciplina'
import PreRequisito from 'App/Models/PreRequisito'
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
            
            const prerequisitos = await PreRequisito
            .query()
            .where('disciplina_id', disciplina?.id)

            const item = {
                nome: disciplina?.nome,
                nucleo: disciplina?.nucleo,
                codigo: disciplina?.codigo,
                periodo: disciplina?.periodo,
                creditos: disciplina?.creditos,
                carga_horaria: disciplina?.carga_horaria,
                objetivo: disciplina?.objetivo,
                ementa: disciplina?.ementa,
                bibliografia_basica: disciplina?.bibliografia_basica,
                bibliografia_complementar: disciplina?.bibliografia_complementar,
                unidades: unidades,
                pre_requisitos: prerequisitos
            }

            return view.render('teste', { disciplina: item})

        } catch (error) {
            return response.badRequest('Error' + error)
        }
    }
}