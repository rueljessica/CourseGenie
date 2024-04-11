/* eslint-disable prettier/prettier */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Disciplina from 'App/Models/Disciplina'
import DisciplinasCursada from 'App/Models/DisciplinasCursada'

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

            let media = 0;
            let professoresSet = new Set<string>();

            const disciplina = await Disciplina.query()
            .where('codigo', codigo)
            .preload('preRequisitos', (preRequisito) => {
                preRequisito.select(['id', 'nome', 'codigo']);
            })
            .preload('conteudoProgramaticos', (conteudo) => {
                conteudo.select(['id', 'unidade', 'topicos']);
            })
            .first();

            const disciplinaCursada = await DisciplinasCursada.query()
            .where('codigo', codigo)

            for (const disc of disciplinaCursada) {
                media+= disc.media;
                professoresSet.add(disc.professor);
            }

            media = parseFloat((media/disciplinaCursada.length).toFixed(1));

            const alunosAprovados = disciplinaCursada.filter((aluno) => aluno.media >= 5.0);
            const indiceAprovacao = (alunosAprovados.length / disciplinaCursada.length) * 100;
            const formattedIndiceAprovacao = indiceAprovacao.toFixed(2) + '%';

            const professores = Array.from(professoresSet);
            
            return view.render('layouts/disciplinas/disciplina', { disciplina: disciplina, media: media, professores: professores, formattedIndiceAprovacao : formattedIndiceAprovacao})

        } catch (error) {
            return response.badRequest('Error' + error)
        }
    }
}