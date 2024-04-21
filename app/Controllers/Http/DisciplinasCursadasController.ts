/* eslint-disable prettier/prettier */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DisciplinasCursada from 'App/Models/DisciplinasCursada'
import Disciplina from 'App/Models/Disciplina'

const unorm = require('unorm');

export default class DisciplinasCursadasController {
    public async list(auth) {
        return await DisciplinasCursada
            .query()
            .where('user_id', auth.user?.id)
    }

    public async store(user, disciplinasData) {
        let disciplinas: DisciplinasCursada[] = [];

        for (const disciplinaData of disciplinasData) {
            const disciplina = new DisciplinasCursada()

            disciplinaData.nome = disciplinaData.nome || '--'
            disciplinaData.codigo = disciplinaData.codigo || '--'
            disciplinaData.situacao = disciplinaData.situacao || '--'
            disciplinaData.ano = disciplinaData.ano || '--'
            disciplinaData.professor = disciplinaData.professor || '--'

            //busca de tipo
            const discByCode = await Disciplina.query()
                .where('codigo', disciplinaData.codigo)
                .first()

            if (discByCode?.periodo) {
                if (discByCode?.periodo === -1) {
                    disciplinaData.tipo = "OPTATIVA"
                } else if (discByCode?.periodo === -2) {
                    disciplinaData.tipo = "AA"
                } else {
                    disciplinaData.tipo = "OBRIGATORIA"
                }
            }
            else {
                const normalizeString = (str) => unorm.nfd(str).replace(/[\u0300-\u036f]/g, '');

                // Consulta no banco de dados
                const discByName = await Disciplina.query()
                    .whereRaw("LOWER(UNACCENT(nome)) = ?",
                        normalizeString(disciplinaData.nome.toLowerCase()))
                    .first();

                if (discByName) {
                    disciplinaData.tipo = "EQUIVALENTE"
                    disciplinaData.equivalenciaId = discByName.id;
                } else {
                    disciplinaData.tipo = null
                }
            }

            disciplina.fill(disciplinaData)
            disciplinas.push(disciplina)
        }

        if (disciplinas.filter(a => a.codigo === "TM422" && ['CUMPRIU', 'APR', 'APRN', 'INCORP', 'CUMP'].includes(a.situacao)).length > 0) {
            if (disciplinas.filter(a => a.codigo === "AA783" && ['CUMPRIU', 'APR', 'APRN', 'INCORP', 'CUMP'].includes(a.situacao)).length > 0) {
                const pe = await Disciplina.query()
                    .where('codigo', "TN706")
                    .first()

                disciplinas = disciplinas.filter(a => a.codigo !== "AA783");
                let pes = disciplinas.filter(a => a.codigo == "TM422");
                pes.forEach(a => a.equivalenciaId = pe?.id || a.equivalenciaId);
                pes.forEach(a => a.tipo = "EQUIVALENTE");
            }
        }

        await user.related('disciplinas').saveMany(disciplinas);
    }

    private async listCods(auth): Promise<string[]> {
        const listDisciplinas = await DisciplinasCursada
            .query()
            .where('user_id', auth.user?.id)
            .whereIn('situacao', ['CUMPRIU', 'APR', 'APRN', 'INCORP', 'CUMP']);

        const codigos = listDisciplinas.map((disciplina) => disciplina.codigo);
        const idEquivalentes = listDisciplinas.map((disciplina) => disciplina.equivalenciaId);

        const listDisciplinasEquiv = await Disciplina
            .query()
            .whereIn('id', idEquivalentes)

        const codigosEquiv = listDisciplinasEquiv.map((disciplina) => disciplina.codigo);

        const codigosOP = listDisciplinas
            .filter((disciplina) => disciplina.tipo === "OPTATIVA")
            .flatMap((_, index) => `OP${index + 1}`);

        const codigosEletiva = listDisciplinas
            .filter((disciplina) => disciplina.tipo === "ELETIVA")
            .map((_) => `ELETIVA`);


        return codigos.concat(codigosOP, codigosEletiva, codigosEquiv);
    }

    public async listGrade({ auth, response, view }: HttpContextContract) {
        try {
            const result = await this.listCods(auth);
            return view.render('disciplinas/grade_curricular', { disciplinas: result })
        } catch (error) {
            return response.status(500).json({ error: error.message })
        }
    }

    public async listEixos({ auth, response, view }: HttpContextContract) {
        try {
            const result = await this.listCods(auth);
            return view.render('disciplinas/eixos', { disciplinas: result })
        } catch (error) {
            return response.status(500).json({ error: error.message })
        }
    }

    public async update({ auth, request, response, view }: HttpContextContract) {
        try {
            const { disciplina, ano, professor, situacao, codigo, media, tipo, equivalente, anoAnterior, codigoAnterior, situacaoAnterior } = request.all()
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
            disciplinaToUpdate.tipo = tipo
            disciplinaToUpdate.equivalenciaId = equivalente;

            // Salva as alterações no banco de dados
            await disciplinaToUpdate.save()
            const disciplinasCurs = await this.list(auth);

            const disciplinas = await Disciplina
                .query()

            return view.render('users/editar_dadosHistorico', { disciplinas: disciplinas, disciplinasCursadas: disciplinasCurs })
        } catch (error) {
            return response.status(500).json({ message: 'Ocorreu um erro ao atualizar a disciplina', error: error.message })
        }
    }
}
