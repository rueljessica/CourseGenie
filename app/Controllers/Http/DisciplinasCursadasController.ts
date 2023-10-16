/* eslint-disable prettier/prettier */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DisciplinasCursada from 'App/Models/DisciplinasCursada'

export default class DisciplinasCursadasController {
    public async store(user, disciplinasData) {
        const disciplinas = []

        for (const disciplinaData of disciplinasData) {
            const disciplina = new DisciplinasCursada()

            disciplinaData.nome = disciplinaData.nome || '--'
            disciplinaData.codigo = disciplinaData.codigo || '--'
            disciplinaData.situacao = disciplinaData.situacao || '--'
            disciplinaData.ano = disciplinaData.ano || '--'
            disciplinaData.professor = disciplinaData.professor || '--'

            disciplina.fill(disciplinaData)
            disciplinas.push(disciplina)
        }

        await user.related('disciplinas').saveMany(disciplinas)
    }

    public async list(auth) {
        return await DisciplinasCursada
            .query()
            .where('user_id', auth.user?.id)
    }
    /*
    public async get({ params, view, auth }: HttpContextContract) {
        const disciplina = await DisciplinasCursada.query()
            .where('user_id', auth.user?.id)
            .where('codigo', params.codigo)
            .where('ano', params.ano)
            .where('situacao', params.situacao)
            .first()

        if (!disciplina) {
            return 'Disciplina não encontrada'
        }
        console.log(disciplina.nome)
        return view.render('layouts/disciplinas/edit', { disciplina })
    }*/

    public async update({ auth, request, response, view }: HttpContextContract) {
        try {
            const { disciplina, ano, professor, situacao, codigo, media, anoAnterior, codigoAnterior, situacaoAnterior} = request.all()

            const disciplinaToUpdate = await DisciplinasCursada.query()
                .where('user_id', auth.user?.id)
                .where('codigo', codigoAnterior)
                .where('ano', anoAnterior)
                .where('situacao', situacaoAnterior)
                .first()

            if (!disciplinaToUpdate) {
                return response.status(404).json({ message: 'Disciplina não encontrada' })
            }

            // Atualiza os campos da disciplina
            disciplinaToUpdate.nome = disciplina
            disciplinaToUpdate.ano = ano
            disciplinaToUpdate.professor = professor
            disciplinaToUpdate.situacao = situacao
            disciplinaToUpdate.codigo = codigo
            disciplinaToUpdate.media = media

            // Salva as alterações no banco de dados
            await disciplinaToUpdate.save()
            const disciplinas = await this.list(auth);

            return view.render('confirm_dadosHistorico', { disciplinas: disciplinas })
        } catch (error) {
            return response.status(500).json({ message: 'Ocorreu um erro ao atualizar a disciplina', error: error.message })
        }
    }
}
