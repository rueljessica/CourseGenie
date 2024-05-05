/* eslint-disable prettier/prettier */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Disciplina from 'App/Models/Disciplina'
import DisciplinasCursada from 'App/Models/DisciplinasCursada'
import Professor from 'App/Models/Professor'

export default class DisciplinasController {
    public async list({ view, response }: HttpContextContract) {
        try {
            const list = await Disciplina.all()
            return view.render('disciplinas/disciplinas', { disciplinas: list })
        } catch (error) {
            return response.badRequest('Error')
        }
    }

    private async mapearIds(list) {
        const listMod = {};

        for (const professor of Object.keys(list)) {
            const professorDb = await Professor.query()
                .where('id', professor)
                .first();
            if (professorDb)
                listMod[professorDb.apelido] = list[professor]
        }
        return listMod;
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

            const disciplinasCursadas = await DisciplinasCursada.query()
                .select('professor_id', 'media', 'situacao')
                .where('codigo', codigo)

            // Calcula a média global da disciplina
            const mediaGlobal = disciplinasCursadas.reduce((acc, cur) => acc + cur.media, 0) / disciplinasCursadas.length;
            // Calcula o índice de aprovação global
            const totalApr = disciplinasCursadas.filter(disciplina => ['cumpriu', 'apr', 'aprn', 'incorp', 'cump'].includes(disciplina.situacao.toLowerCase())).length;
            const indiceAprGlobal = (totalApr / disciplinasCursadas.length) * 100;

            // Calcula a média por professor que lecionou a disciplina
            let mediasPorProfessor: { [key: string]: number } = {};
            disciplinasCursadas.forEach(disciplina => {
                if (disciplina.professorId) {
                    if (!mediasPorProfessor[disciplina.professorId]) {
                        mediasPorProfessor[disciplina.professorId] = 0;
                    }
                    mediasPorProfessor[disciplina.professorId] += disciplina.media;
                }
            });
            Object.keys(mediasPorProfessor).forEach(professor => {
                mediasPorProfessor[professor] /= disciplinasCursadas.filter(disciplina => disciplina.professorId?.toString() === professor).length;
                mediasPorProfessor[professor] = parseFloat(mediasPorProfessor[professor].toFixed(1))
            });

            /// Calcula o índice de aprovação por professor
            let indiceAprovacaoPorProfessor: { [key: string]: { aprovacao: number; reprovacao: number } } = {};
            disciplinasCursadas.forEach(disciplina => {
                if (disciplina.professorId) {
                    if (!indiceAprovacaoPorProfessor[disciplina.professorId]) {
                        indiceAprovacaoPorProfessor[disciplina.professorId] = { aprovacao: 0, reprovacao: 0 };
                    }
                    if (['cumpriu', 'apr', 'aprn', 'incorp', 'cump'].includes(disciplina.situacao.toLowerCase())) {
                        indiceAprovacaoPorProfessor[disciplina.professorId].aprovacao++;
                    } else {
                        indiceAprovacaoPorProfessor[disciplina.professorId].reprovacao++;
                    }
                }
            });

            Object.keys(indiceAprovacaoPorProfessor).forEach(professor => {
                const count = disciplinasCursadas.filter(disciplina => disciplina.professorId?.toString() === professor).length;
                const indiceAprovacao = indiceAprovacaoPorProfessor[professor].aprovacao / count * 100;
                const indiceReprovacao = indiceAprovacaoPorProfessor[professor].reprovacao / count * 100;
                indiceAprovacaoPorProfessor[professor] = { aprovacao: parseInt(indiceAprovacao.toFixed(0)), reprovacao: parseInt(indiceReprovacao.toFixed(0)) };
            });

            mediasPorProfessor = await this.mapearIds(mediasPorProfessor)
            indiceAprovacaoPorProfessor = await this.mapearIds(indiceAprovacaoPorProfessor)

            return view.render('layouts/disciplinas/disciplina', { disciplina: disciplina, mediaGlobal: mediaGlobal.toFixed(1), indiceAprGlobal: indiceAprGlobal.toFixed(0), mediasPorProfessor: JSON.stringify(mediasPorProfessor), indiceAprovacaoPorProfessor: JSON.stringify(indiceAprovacaoPorProfessor) })
        } catch (error) {
            return response.badRequest('Error' + error)
        }
    }
}