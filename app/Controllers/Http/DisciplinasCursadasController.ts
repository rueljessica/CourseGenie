/* eslint-disable prettier/prettier */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DisciplinasCursada from 'App/Models/DisciplinasCursada'
import Disciplina from 'App/Models/Disciplina'
import Professor from 'App/Models/Professor';

const unorm = require('unorm');

export default class DisciplinasCursadasController {
    public async store(user, disciplinasData) {
        let disciplinas: DisciplinasCursada[] = [];

        for (const disciplinaData of disciplinasData) {
            const disciplina = new DisciplinasCursada()

            disciplinaData.nome = disciplinaData.nome || '--'
            disciplinaData.codigo = disciplinaData.codigo || '--'
            disciplinaData.situacao = disciplinaData.situacao || '--'
            disciplinaData.ano = disciplinaData.ano || '--'

            if (disciplinaData.professor) {
                const normalizeString = (str) => unorm.nfd(str).replace(/[\u0300-\u036f]/g, '');
                let professor = await Professor.query()
                    .whereRaw("LOWER(UNACCENT(nome)) = ?",
                        normalizeString(disciplinaData.professor.toLowerCase())).first();
                if (!professor) {
                    professor = await Professor.query()
                        .where('nome', "Outro").first();
                }
                disciplinaData.professorId = professor?.id
            }

            //busca de tipo
            const discByCode = await Disciplina.query()
                .where('codigo', disciplinaData.codigo)
                .first()

            if (discByCode?.periodo) {
                if (discByCode?.periodo === -1) {
                    disciplinaData.tipo = "OP"
                } else if (discByCode?.periodo === -2) {
                    disciplinaData.tipo = "AA"
                } else {
                    disciplinaData.tipo = "OB"
                }
                disciplinaData.cargaHoraria = discByCode?.cargaHoraria
            }
            else {
                const normalizeString = (str) => unorm.nfd(str).replace(/[\u0300-\u036f]/g, '');

                // Consulta no banco de dados
                const discByName = await Disciplina.query()
                    .whereRaw("LOWER(UNACCENT(nome)) = ?",
                        normalizeString(disciplinaData.nome.toLowerCase()))
                    .first();

                if (discByName) {
                    disciplinaData.equivalenciaId = discByName.id;
                    disciplinaData.cargaHoraria = discByName.cargaHoraria
                    if (discByName.periodo == -1)
                        disciplinaData.tipo = "EQOP";
                    else
                        disciplinaData.tipo = "EQOB";
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
                pes.forEach(a => a.tipo = "EQOB");
                pes.forEach(a => a.cargaHoraria = pe?.cargaHoraria || 90);
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
            .filter((disciplina) => disciplina.tipo === "OP" || disciplina.tipo === "EQOP")
            .flatMap((_, index) => `OP${index + 1}`);

        const codigosEletiva = listDisciplinas
            .filter((disciplina) => disciplina.tipo === "EL")
            .map((_) => `ELETIVA`);


        return codigos.concat(codigosOP, codigosEletiva, codigosEquiv);
    }

    public async showGrade({ auth, response, view }: HttpContextContract) {
        try {
            const result = await this.listCods(auth);
            return view.render('disciplinas/grade/grade_curricular', { disciplinas: result })
        } catch (error) {
            return response.status(500).json({ error: error.message })
        }
    }

    public async showEixos({ auth, response, view }: HttpContextContract) {
        try {
            const result = await this.listCods(auth);
            return view.render('disciplinas/eixo/eixos', { disciplinas: result })
        } catch (error) {
            return response.status(500).json({ error: error.message })
        }
    }

    public async historicoUpdate({ auth, view }: HttpContextContract) {
        const disciplinasCurs = await await DisciplinasCursada
            .query()
            .where('user_id', auth.user?.id)
            .orderBy('ano')
            .orderBy('nome');

        // list para modal de equivalntes
        const disciplinas = await Disciplina
            .query()
            .orderBy('nome')

        // list para modal de professores
        const professores = await Professor
            .query()
            .orderBy('nome')

        return view.render('users/editar_dadosHistorico', { disciplinas: disciplinas, professores: professores, disciplinasCursadas: disciplinasCurs })
    }

    public async update({ auth, request, response }: HttpContextContract) {
        try {
            const data = request.all();
            // Valide os dados da requisição
            await request.validate({
                schema: DisciplinasCursada.schema,
                data: data
            })
            const disciplinaToUpdate = await DisciplinasCursada.findOrFail(data.id);

            // Se houver uma disciplina equivalente, atualiza a carga horária e define como equivalência para disciplinas semelhantes
            if (data.equivalenciaId) {
                const eq = await Disciplina.findOrFail(data.equivalenciaId)
                data.cargaHoraria = eq.cargaHoraria;

                // Encontre todas as disciplinas com o mesmo código
                const disciplinas = await DisciplinasCursada.query()
                    .where('user_id', auth.user?.id)
                    .where('codigo', data.codigo)
                    .whereNot('id', data.id) // Exclue a disciplina que está sendo atualizada

                await Promise.all(disciplinas.map(async (disciplina) => {
                    disciplina.equivalenciaId = data.equivalenciaId
                    disciplina.cargaHoraria = eq.cargaHoraria
                    disciplina.tipo = data.tipo
                    await disciplina.save()
                }))
            }

            // Atualizar os campos da disciplina
            disciplinaToUpdate.merge({
                nome: data.nome,
                ano: data.ano,
                professorId: parseInt(data.professor) || null,
                situacao: data.situacao,
                codigo: data.codigo,
                media: data.media,
                tipo: data.tipo,
                equivalenciaId: data.equivalenciaId,
                cargaHoraria: data.cargaHoraria
            })

            // Salve as alterações no banco de dados
            await disciplinaToUpdate.save();
            return response.redirect().toRoute('disciplina.historicoUpdate');
        } catch (error) {
            return response.status(400).json({ message: error });
        }
    }

    public async create({ auth, request, response }: HttpContextContract) {
        try {
            const data = request.only(['addDisciplina', 'addCodigo', 'addSituacao', 'addAno', 'addProfessor', 'addMedia', 'addTipo', 'addCargaHoraria', 'addEquivalente']);

            const disciplinaData = {
                nome: data.addDisciplina,
                codigo: data.addCodigo,
                situacao: data.addSituacao,
                ano: data.addAno,
                professorId: parseInt(data.addProfessor),
                media: parseFloat(data.addMedia),
                tipo: data.addTipo,
                cargaHoraria: parseInt(data.addCargaHoraria) || null,
                equivalenciaId: parseInt(data.addEquivalente) || null,
            }
            // Valide os dados da requisição
            await request.validate({
                schema: DisciplinasCursada.schema,
                data: disciplinaData
            })
            const disciplina = new DisciplinasCursada()
            disciplina.fill(disciplinaData)

            await auth.user?.related('disciplinas').save(disciplina);
            return response.redirect().toRoute('disciplina.historicoUpdate');
        } catch (error) {
            return response.status(400).json({ message: error });
        }
    }

    public async destroy({ params, response }: HttpContextContract) {
        try {
            const disciplina = await DisciplinasCursada.findOrFail(params.id)
            await disciplina.delete()

            return response.status(200)
        } catch (error) {
            return response.status(400).json({ message: 'Erro ao excluir a disciplina cursada', error: error.message })
        }
    }
}
