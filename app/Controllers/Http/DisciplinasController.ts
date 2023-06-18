/* eslint-disable prettier/prettier */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Disciplina from 'App/Models/Disciplina'

export default class DisciplinasController {
    public async list({ view, response }: HttpContextContract) {
        try {
            const list = await Disciplina.all()
            return view.render('disciplinas', {disciplinas: list})
        } catch (error) {
            return response.badRequest('Error')
        }
    }

    public async get({ request, response, view}: HttpContextContract) {
        try {
            const body = request.only(['disc'])
            var codigo = body.disc
            
            const disciplina = await Disciplina
            .query()
            .where('codigo', codigo)
            .first()

            //console.log(disciplina.body)

            var ob = JSON.parse(disciplina?.body)

            
            var teste = JSON.parse(ob.conteudo_programatico)

            console.log(teste)


            return view.render('teste', {disciplina: ob})
            
        } catch (error) {
            return response.badRequest('Error')
        }
    }
}