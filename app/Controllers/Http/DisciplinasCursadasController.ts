/* eslint-disable prettier/prettier */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DisciplinasCursada from 'App/Models/DisciplinasCursada'
import Disciplina from 'App/Models/Disciplina'

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
            disciplinaData.professor = disciplinaData.professor || '--'

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

    public async listGrade({ auth, response, view }: HttpContextContract) {
        try {
            const result = await this.listCods(auth);
            return view.render('disciplinas/grade/grade_curricular', { disciplinas: result })
        } catch (error) {
            return response.status(500).json({ error: error.message })
        }
    }

    public async listEixos({ auth, response, view }: HttpContextContract) {
        try {
            const result = await this.listCods(auth);
            return view.render('disciplinas/eixo/eixos', { disciplinas: result })
        } catch (error) {
            return response.status(500).json({ error: error.message })
        }
    }

    public async get({ auth, view }: HttpContextContract) {
        const disciplinasCurs = await await DisciplinasCursada
            .query()
            .where('user_id', auth.user?.id)
            .orderBy('ano')
            .orderBy('nome');

        // list para modal de equivalntes
        const disciplinas = await Disciplina
            .query()
            .orderBy('nome')
        return view.render('users/editar_dadosHistorico', { disciplinas: disciplinas, disciplinasCursadas: disciplinasCurs })
    }

    public async update({ request, response }: HttpContextContract) {
        try {
            const data = request.all();

            // Valide os dados da requisição
            await request.validate({
                schema: DisciplinasCursada.schema,
                data: data
            })
            const disciplinaToUpdate = await DisciplinasCursada.findOrFail(data.id);

             // Se houver uma disciplina equivalente, atualize a carga horária
             if (data.equivalenciaId) {
                const eq = await Disciplina.findOrFail(data.equivalenciaId);
                data.cargaHoraria = eq.cargaHoraria;
            }

            // Atualizar os campos da disciplina
            disciplinaToUpdate.merge({
                nome: data.nome,
                ano: data.ano,
                professor: data.professor,
                situacao: data.situacao,
                codigo: data.codigo,
                media: data.media,
                tipo: data.tipo,
                equivalenciaId: data.equivalenciaId,
                cargaHoraria: data.cargaHoraria
            })

            // Salve as alterações no banco de dados
            await disciplinaToUpdate.save();
            return response.redirect().toRoute('auth.edit');
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
                professor: data.addProfessor,
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
            return response.redirect().toRoute('disciplina.get');
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
