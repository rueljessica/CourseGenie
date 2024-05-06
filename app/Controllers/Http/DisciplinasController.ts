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

    private async mapearApelidos(list) {
        const listMod = {};
    
        for (const professor of Object.keys(list)) {
            const professorDb = await Professor.query()
                .where('nome', professor)
                .first();
            if (professorDb)
                listMod[professorDb.apelido] = list[professor]
        }
        return listMod;
    }
    
    public async get({ params, response, view }: HttpContextContract) {
        try {
            var codigo = params.id;

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
                .select('professor', 'media', 'situacao')
                .where('codigo', codigo)

            // Calcula a média global da disciplina
            const mediaGlobal = disciplinasCursadas.reduce((acc, cur) => acc + cur.media, 0) / disciplinasCursadas.length;
            // Calcula o índice de aprovação global
            const totalApr = disciplinasCursadas.filter(disciplina => ['cumpriu', 'apr', 'aprn', 'incorp', 'cump'].includes(disciplina.situacao.toLowerCase())).length;
            const indiceAprGlobal = (totalApr / disciplinasCursadas.length) * 100;

            // Calcula a média por professor que lecionou a disciplina
            let mediasPorProfessor: { [key: string]: number } = {};
            disciplinasCursadas.forEach(disciplina => {
                if (!mediasPorProfessor[disciplina.professor]) {
                    mediasPorProfessor[disciplina.professor] = 0;
                }
                mediasPorProfessor[disciplina.professor] += disciplina.media;
            });
            Object.keys(mediasPorProfessor).forEach(professor => {
                mediasPorProfessor[professor] /= disciplinasCursadas.filter(disciplina => disciplina.professor === professor).length;
                mediasPorProfessor[professor] = parseFloat(mediasPorProfessor[professor].toFixed(1))
            });

            /// Calcula o índice de aprovação por professor
            let indiceAprovacaoPorProfessor: { [key: string]: { aprovacao: number; reprovacao: number } } = {};
            disciplinasCursadas.forEach(disciplina => {
                if (!indiceAprovacaoPorProfessor[disciplina.professor]) {
                    indiceAprovacaoPorProfessor[disciplina.professor] = { aprovacao: 0, reprovacao: 0 };
                }
                if (['cumpriu', 'apr', 'aprn', 'incorp', 'cump'].includes(disciplina.situacao.toLowerCase())) {
                    indiceAprovacaoPorProfessor[disciplina.professor].aprovacao++;
                } else {
                    indiceAprovacaoPorProfessor[disciplina.professor].reprovacao++;
                }
            });

            Object.keys(indiceAprovacaoPorProfessor).forEach(professor => {
                const count = disciplinasCursadas.filter(disciplina => disciplina.professor.toLowerCase() === professor.toLowerCase()).length;
                const indiceAprovacao = indiceAprovacaoPorProfessor[professor].aprovacao / count * 100;
                const indiceReprovacao = indiceAprovacaoPorProfessor[professor].reprovacao / count * 100;
                indiceAprovacaoPorProfessor[professor] = { aprovacao: parseInt(indiceAprovacao.toFixed(0)), reprovacao: parseInt(indiceReprovacao.toFixed(0)) };
            });

            mediasPorProfessor = await this.mapearApelidos(mediasPorProfessor)
            indiceAprovacaoPorProfessor = await this.mapearApelidos(indiceAprovacaoPorProfessor)

            return view.render('disciplinas/disciplina', { disciplina: disciplina, mediaGlobal: mediaGlobal.toFixed(1), indiceAprGlobal: indiceAprGlobal.toFixed(0), mediasPorProfessor: JSON.stringify(mediasPorProfessor), indiceAprovacaoPorProfessor: JSON.stringify(indiceAprovacaoPorProfessor) })
        } catch (error) {
            return response.badRequest('Error' + error)
        }
    }
}