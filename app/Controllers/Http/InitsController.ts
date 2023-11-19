/* eslint-disable prettier/prettier */
import Professor from 'App/Models/Professor'
import Disciplina from 'App/Models/Disciplina'
import ConteudoProgramatico from 'App/Models/ConteudoProgramatico'
import * as fs from 'fs';

export default class InitsController {
    public async index({ view, response}) {
        //PROFESSORES
        var filePath = process.cwd() + '/init_json/professores.json';
        fs.readFile(filePath, 'utf8', async (err, data) => {
            if (err) {
                return response.badRequest(`Erro ao ler o arquivo JSON: ${err}`);
            }

            try {
                const dadosProfessores = JSON.parse(data);
                for (const dadosProfessor of dadosProfessores) {
                    const existingProfessor = await Professor.query()
                        .where('nome', dadosProfessor.nome)
                        .first();

                    if (!existingProfessor) {
                        await Professor.create(dadosProfessor);
                    }
                }
            } catch (parseError) {
                return response.badRequest(`Erro ao fazer o parsing do JSON: ${parseError}`);
            }
        });
        // DISCIPLINAS
        filePath = process.cwd() + '/init_json/disciplinas_final.json';
        fs.readFile(filePath, 'utf8', async (err, data) => {
            if (err) {
                return response.badRequest(`Erro ao ler o arquivo JSON: ${err}`);
            }
            try {
                const dataDisc = JSON.parse(data);
                for (const data of dataDisc) {
                    const existingDisc = await Disciplina.query()
                        .where('codigo', data.codigo)
                        .first();

                    if (!existingDisc) {
                        // Crie uma nova instância da disciplina com os dados fornecidos
                        const disciplina = new Disciplina()
                        disciplina.fill({
                            codigo: data.codigo,
                            nucleo: data.nucleo,
                            nome: data.nome,
                            periodo: data.periodo,
                            creditos: data.creditos,
                            cargaHoraria: data.carga_horaria,
                            objetivo: data.objetivo,
                            ementa: data.ementa,
                            bibliografia_basica: data.bibliografia_basica,
                            bibliografia_complementar: data.bibliografia_complementar
                        })

                        // Salve a disciplina no banco de dados
                        await disciplina.save()

                        // Adicione os pré-requisitos se houver
                        if (data.pre_requisito && data.pre_requisito.length > 0) {
                            const preRequisitos = await Disciplina.query()
                                .whereIn('codigo', data.pre_requisito.map((p) => p.codigo))
                                .orWhereIn('nome', data.pre_requisito.map((p) => p.nome))
                                .exec()

                            await disciplina.related('preRequisitos').sync(preRequisitos.map((p) => p.id))
                        }

                        // Adicione o conteúdo programático
                        if (data.conteudo_programatico && data.conteudo_programatico.length > 0) {
                            for (const conteudoData of data.conteudo_programatico) {
                                const conteudo = new ConteudoProgramatico();
                                conteudo.fill({
                                    disciplinaId: disciplina.id,
                                    unidade: conteudoData.unidade,
                                    topicos: conteudoData.topicos,
                                });
                                await conteudo.save();
                            }
                        }
                    }
                }
            } catch (parseError) {
                return response.badRequest(`Erro ao fazer o parsing do JSON: ${parseError}`);
            }
        });
        return view.render('home/home');
    }
}