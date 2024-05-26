import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Disciplina from 'App/Models/Disciplina';
import Professor from 'App/Models/Professor';
import Turma from 'App/Models/Turma';
import { JSDOM } from 'jsdom';
const fs = require('fs');
const unorm = require('unorm');

export default class TurmasController {
    private async scraper() {
        try {
            // Lendo o arquivo HTML local
            const html = fs.readFileSync("C:\\Users\\arauj\\OneDrive\\Documentos\\sigaa-turmas.html", 'utf-8');

            // Usando JSDOM para criar uma representação DOM do HTML
            const dom = new JSDOM(html);

            // Acessando o documento HTML
            const document = dom.window.document;

            // Encontrando o elemento com o ID "lista-turmas"
            const listaTurmas = document.getElementById('lista-turmas');

            // Verificando se o elemento foi encontrado
            if (listaTurmas) {
                // Iterando sobre as linhas da tabela
                const linhas = listaTurmas.querySelectorAll('tbody > tr');

                linhas.forEach((linha) => {
                    // Extraindo os dados de cada linha
                    const anoPeriodo = linha.querySelector('td:nth-child(1)')?.textContent?.trim();
                    const docente = linha.querySelector('td:nth-child(3)')?.textContent?.trim();
                    const tipo = linha.querySelector('td:nth-child(4)')?.textContent?.trim();
                    const modalidade = linha.querySelector('td:nth-child(5)')?.textContent?.trim();
                    const situacao = linha.querySelector('td:nth-child(6)')?.textContent?.trim();
                    const horario = linha.querySelector('td:nth-child(7)')?.textContent?.trim();
                    const local = linha.querySelector('td:nth-child(8)')?.textContent?.trim();
                    const matriculasCapacidade = linha.querySelector('td:nth-child(9)')?.textContent?.trim();

                    // Exibindo os dados extraídos
                    console.log('Ano/Período:', anoPeriodo);
                    console.log('Docente(s):', docente);
                    console.log('Tipo:', tipo);
                    console.log('Modalidade:', modalidade);
                    console.log('Situação:', situacao);
                    console.log('Horário:', horario);
                    console.log('Local:', local);
                    console.log('Matrículas/Capacidade:', matriculasCapacidade);
                    console.log('---');
                });
            } else {
                console.log('Elemento "lista-turmas" não encontrado.');
            }
        } catch (error) {
            console.error('Ocorreu um erro:', error);
        }
    }

    public async index({ }: HttpContextContract) {
        this.scraper();
    }

    public async create({ response }) {
        var filePath = process.cwd() + '/init_json/turmas.json';
        fs.readFile(filePath, 'utf8', async (err, data) => {
            if (err) {
                return response.badRequest(`Erro ao ler o arquivo JSON: ${err}`);
            }

            try {
                const turmasData = JSON.parse(data);
                for (const turmaData of turmasData) {
                    // Verifica se já existe uma turma com o mesmo código, ano, período e turma
                    const existingTurma = await Turma.query()
                        .where('codigo', turmaData.codigo)
                        .where('ano', turmaData.ano)
                        .where('periodo', turmaData.periodo)
                        .where('turma', turmaData.turma)
                        .first()

                    if (existingTurma) {
                        continue // Pula para a próxima iteração do loop
                    }

                    const turma = new Turma()
                    turma.codigo = turmaData.codigo
                    turma.nome = turmaData.nome
                    turma.ano = turmaData.ano
                    turma.periodo = turmaData.periodo
                    turma.turma = turmaData.turma
                    turma.local = turmaData.local
                    turma.capacidade = turmaData.capacidade

                    const disciplina = await Disciplina.query()
                        .where('codigo', turmaData.codigo)
                        .first();

                    if (disciplina) {
                        turma.disciplinaId = disciplina.id;
                    }

                    // Encontra o professor correspondente pelo nome
                    if (turmaData.professor) {
                        const normalizeString = (str) => unorm.nfd(str).replace(/[\u0300-\u036f]/g, '').toLowerCase();
                        const professor = await Professor.query()
                            .whereRaw("LOWER(UNACCENT(nome)) = ?",
                                normalizeString(turmaData.professor.toLowerCase()))
                            .first();

                        if (professor) {
                            turma.professorId = professor.id
                        }
                    }
                    if (turmaData.horario) {
                        turma.horario = turmaData.horario
                        const todosFormatadosCorretamente = turma.horario.flatMap((item) => {
                            if (!/^[1-7]{2}[TN][1-5]$/.test(item)) {
                                return false;
                            }
                        });

                        if (todosFormatadosCorretamente) {
                            turma.horario = turma.horario.flatMap((item) => {
                                const dias = item.substring(0, 2);
                                return [`${dias}T56`];
                            });
                        }
                        turma.horario = [...new Set(turma.horario)];

                        turma.horario = turma.horario.flatMap((item) => {
                            if (item.length === 5 && /^[0-9]+$/.test(item.substring(0, 1))) {
                                const dias = item.substring(0, 2);
                                const periodo = item.substring(2, 3);
                                const hora = item.substring(3);
                                const newItems: string[] = []
                                newItems.push(`${dias[0]}${periodo}${hora}`, `${dias[1]}${periodo}${hora}`)
                                return newItems
                            }
                            return item
                        })
                    }
                    // Salva a turma no banco de dados
                    await turma.save()
                }

                return 'Turmas cadastradas com sucesso'
            } catch (error) {
                return `Erro ao cadastrar turmas: ${error.message}`
            }
        });
    }
}