/* eslint-disable prettier/prettier */
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from "App/Models/User";
import Disciplina from "App/Models/Disciplina";
import Professor from "App/Models/Professor";
import DisciplinasCursada from 'App/Models/DisciplinasCursada';
import DisciplinaPreRequisito from 'App/Models/DisciplinaPreRequisito';
import DisciplinasCursadaController from 'App/Controllers/Http/DisciplinasCursadasController'
import Database from '@ioc:Adonis/Lucid/Database';

export default class TestDataController {
    public async index({ response, params }: HttpContextContract) {
        const { faker } = require('@faker-js/faker');
        const random = require('lodash');
        let cods: string[] = [];
        let numberOfOp = 0;
        const qntUsers = params.id;

        try {
            const USERS: User[] = [];

            const createDiscUser = async (user: User) => {
                const trx = await Database.transaction();

                try {
                    let randomDisc;
                    let condition = true;

                    while (condition) {
                        randomDisc = await Disciplina.query()
                            .orderByRaw('RANDOM()')
                            .useTransaction(trx)
                            .first();

                        //console.log(">> disciplina selecionada: " + randomDisc.nome + " | codigo: " + randomDisc.codigo);
                        if (!cods.includes(randomDisc?.codigo)) {
                            //console.log(">> disciplina ainda não foi cadastrada para esse usuário | id: " + randomDisc.id);
                            const preRequisitos = await DisciplinaPreRequisito.query()
                                .where('disciplina_id', randomDisc.id)
                                .useTransaction(trx);

                            let prereqsFulfilled = true;

                            if (preRequisitos.length > 0) {
                                //console.log(">> disciplina tem pre requisitos");
                                for (const preReq of preRequisitos) {
                                    const discPreRequisito = await Disciplina.query()
                                        .where('id', preReq.preRequisitoId)
                                        .useTransaction(trx)
                                        .first();

                                    //console.log(">> preReq.id: " + preReq.preRequisitoId);
                                    if (!cods.includes(discPreRequisito?.codigo)) {
                                        //console.log(">> usuário NÂO tem o pre requisito: " + discPreRequisito?.nome + " | codigo: " + discPreRequisito?.codigo);
                                        prereqsFulfilled = false;
                                        break;
                                    }
                                    //console.log(">> usuário TEM o pre requisito: " + discPreRequisito?.nome + " | codigo: " + discPreRequisito?.codigo);
                                }
                            }

                            if (prereqsFulfilled) {
                                condition = false;
                                if (randomDisc?.periodo === -1 && numberOfOp < 11) {
                                    numberOfOp++;
                                    //console.log(">> disciplina é optativa e o usuário tem " + numberOfOp + " optativas concluídas");
                                } else if (randomDisc?.periodo === -1) {
                                    condition = true;
                                    //console.log(">> disciplina é optativa e o usuário tem " + numberOfOp + " optativas concluídas (ESGOTOU)");
                                }
                            }
                        }
                    }
                    //console.log(">> disciplina selecionada: " + randomDisc.nome + " | codigo: " + randomDisc.codigo + "(FINAL)");

                    const professor = await Professor.query()
                        .orderByRaw('RANDOM()')
                        .first();

                    let disciplina = new DisciplinasCursada();
                    disciplina.nome = randomDisc.nome;
                    disciplina.codigo = randomDisc.codigo;
                    disciplina.situacao = random.sample(['APR', 'REP']);
                    disciplina.ano = random.sample(['2018', '2019', '2020', '2021', '2022', '2023']);
                    disciplina.professor = professor?.nome || '';

                    if (disciplina.situacao === 'APR') {
                        disciplina.media = parseFloat((Math.random() * (10 - 5) + 5).toFixed(1));
                        cods.push(disciplina.codigo);
                        //console.log(">> usuário foi APR na disciplina | lista de codigos: " + cods);
                    } else if (disciplina.situacao === 'REP') {
                        disciplina.media = parseFloat((Math.random() * (4.9 - 0) + 0).toFixed(1));
                        //console.log(">> usuário foi REP na disciplina | lista de codigos não se altera: " + cods);
                        if (randomDisc?.periodo === -1) {
                            numberOfOp--;
                            //console.log(">> usuário foi REP na disciplina e o número de optativas caiu para " + numberOfOp);
                        }
                    }

                    const disciplinasCursadas = new DisciplinasCursadaController();
                    await disciplinasCursadas.store(user, [disciplina])
                    await trx.commit();
                    //console.log("-------------------------------------------------------------------------------------------");
                } catch (error) {
                    console.error('Erro ao criar disciplina do usuário:', error);
                    await trx.rollback();
                    throw error;
                }
            };

            const createRandomUser = async (): Promise<User> => {

                let user = new User();
                user.name = faker.internet.userName();
                user.email = faker.internet.email();
                user.avatar = faker.image.avatar();
                user.password = faker.internet.password();
                user.historico = "historico.pdf";
                user.save();

                return user;
            };

            for (let i = 0; i < qntUsers; i++) {
                const newUser = await createRandomUser();
                USERS.push(newUser);
            }

            for (const user of USERS) {
                let qntDisc = Math.floor(Math.random() * (38 - 7 + 1)) + 7;
                for (let i = 0; i < qntDisc; i++) {
                    await createDiscUser(user);
                }
                //console.log("qntDisc: " + qntDisc);
                //console.log("cods: " + cods);
                //console.log("numberOfOp: " + numberOfOp);
                numberOfOp = 0;
                cods = [];
                //console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
            }

            return response.status(200).json({ message: 'Dados de teste gerados com sucesso', data: USERS });
        } catch (error) {
            return response.status(500).json({ error: 'Erro ao gerar os dados de teste', message: error.message });
        }
    }
}
