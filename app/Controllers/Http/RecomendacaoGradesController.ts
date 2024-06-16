import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DisciplinasCursadas from 'App/Models/DisciplinasCursada'
import Turma from 'App/Models/Turma'
import User from 'App/Models/User'
import Disciplina from 'App/Models/Disciplina'
import DisciplinaPreRequisito from 'App/Models/DisciplinaPreRequisito'

export default class RecomendacaoGradesController {
  private async verificaEixos(disciplinasCursadas) {
    const eixosContadores: { [key: string]: { precisa: number; possui: number } } = {
      eixo1: { precisa: 3, possui: 0 },
      eixo2: { precisa: 4, possui: 0 },
      eixo3: { precisa: 5, possui: 0 },
      eixo4: { precisa: 5, possui: 0 },
    }

    for (const disciplinaCursada of disciplinasCursadas) {
      const disciplina = await Disciplina.query().where('codigo', disciplinaCursada.codigo).first()

      if (disciplina && disciplina.eixo && disciplina.eixo.length > 0) {
        for (const eixo of disciplina.eixo) {
          const eixoKey = `eixo${eixo}`
          if (eixosContadores[eixoKey]) {
            eixosContadores[eixoKey].possui += 1
          }
        }
      }

      if (disciplinaCursada.equivalenciaId && disciplina) {
        const disciplinaEquivalente = await Disciplina.find(disciplinaCursada.equivalenciaId)
        if (
          disciplinaEquivalente &&
          disciplinaEquivalente.eixo &&
          disciplinaEquivalente.eixo.length > 0
        ) {
          for (const eixo of disciplinaEquivalente.eixo) {
            const eixoKey = `eixo${eixo}`
            if (eixosContadores[eixoKey]) {
              eixosContadores[eixoKey].possui += 1
            }
          }
        }
      }
    }

    return eixosContadores
  }

  private async discCursada(turma, disciplinasCursadas): Promise<boolean> {
    const disciplina = await Disciplina.query().where('id', turma.disciplinaId).first()
    if (disciplina) {
      return disciplinasCursadas.some((disciplinaC) => disciplinaC.codigo === disciplina.codigo || disciplinaC.equivalenciaId === disciplina.id)
    }
    return false
  }

  private async atendePreRequisitos(turma, disciplinasCursadas): Promise<boolean> {
    const disciplina = await Disciplina.query()
      .where('id', turma.disciplinaId)
      .preload('preRequisitos', (preRequisito) => {
        preRequisito.select(['id', 'nome', 'codigo'])
      })
      .first()

    if (disciplina) {
      if (!disciplina.preRequisitos || disciplina.preRequisitos.length === 0)
        return true

      return disciplina.preRequisitos.every((preRequisito) =>
        disciplinasCursadas.some((disciplinaC) => disciplinaC.codigo === preRequisito.codigo || disciplinaC.equivalenciaId === preRequisito.id)
      )
    }
    return false
  }

  private async ePeriodoAluno(turma, periodo): Promise<boolean> {
    const disciplina = await Disciplina.query().where('id', turma.disciplinaId).first()
    return disciplina ? disciplina.periodo === periodo : false
  }

  private async obAnterioresPreReq(turma, periodo): Promise<boolean> {
    const disciplina = await Disciplina.query().where('id', turma.disciplinaId).first()
    if (disciplina && (disciplina.periodo >= periodo || disciplina.periodo < 1))
      return false

    const preRequisitos = await DisciplinaPreRequisito.query().where('pre_requisito_id', disciplina?.id)

    const validacao = await Promise.all(
      preRequisitos.map(async (preRequisito) => {
        const disciplina = await Disciplina.query().where('id', preRequisito.disciplinaId).first()
        return disciplina ? disciplina.periodo >= 1 : false
      })
    )
    return validacao.some((value) => value)
  }

  private async obAnteriores(turma, periodo): Promise<boolean> {
    const disciplina = await Disciplina.query().where('id', turma.disciplinaId).first()
    if (disciplina && disciplina.periodo < periodo && disciplina.periodo >= 1) {
      const preRequisitos = await DisciplinaPreRequisito.query().where('pre_requisito_id', disciplina.id)
      return preRequisitos.length === 0
    }
    return false
  }

  private async complementaEixo(turma, eixosCount) {
    const disciplina = await Disciplina.find(turma.disciplinaId)
    let peso = 0
    if (disciplina && disciplina.eixo && disciplina.eixo.length > 0) {
      turma.eixo = disciplina.eixo
      for (const eixo of disciplina.eixo) {
        const eixoKey = `eixo${eixo}`
        if (eixosCount[eixoKey].precisa === eixosCount[eixoKey].possui) {
          peso += 0
        } else {
          peso += 10 - (eixosCount[eixoKey].precisa - eixosCount[eixoKey].possui)
        }
      }
    }
    return peso
  }

  private async indiceAprProfessor(turma, userId): Promise<number> {
    if (turma.professorId) {
      const disciplinasProfessor = await DisciplinasCursadas.query()
        .where('user_id', userId)
        .where('professor_id', turma.professorId)

      if (disciplinasProfessor.length !== 0) {
        const regex = /^A[A-D][0-9]{3}$/
        const disciplinasFiltradas = disciplinasProfessor.filter((disciplina) => !regex.test(disciplina.codigo))

        if (disciplinasFiltradas.length === 0)
          return 0

        const totalAprovacoes = disciplinasFiltradas.filter((disciplinaCursada) =>
          ['CUMPRIU', 'APR', 'APRN', 'INCORP', 'CUMP'].includes(
            disciplinaCursada.situacao.toUpperCase()
          )
        ).length

        return (totalAprovacoes / disciplinasFiltradas.length) * 100
      }
    }
    return 0
  }

  private async indiceAprDisciplina(turma): Promise<number> {
    const disciplinas = await DisciplinasCursadas.query().where('codigo', turma.codigo)

    if (disciplinas.length === 0) return 0

    const totalAprovacoes = disciplinas.filter((disciplinaCursada) =>
      ['CUMPRIU', 'APR', 'APRN', 'INCORP', 'CUMP'].includes(
        disciplinaCursada.situacao.toUpperCase()
      )
    ).length

    return parseFloat(((totalAprovacoes / disciplinas.length) * 100).toFixed(1))
  }

  private async mediaProfessor(turma, userId): Promise<number> {
    if (turma.professorId) {
      const disciplinasProfessor = await DisciplinasCursadas.query()
        .where('user_id', userId)
        .where('professor_id', turma.professorId)

      if (disciplinasProfessor.length !== 0) {
        const regex = /^A[A-D][0-9]{3}$/
        const disciplinasFiltradas = disciplinasProfessor.filter((disciplina) => !regex.test(disciplina.codigo))

        if (disciplinasFiltradas.length === 0) return 0

        const totalNotas = disciplinasFiltradas.reduce((total, disciplina) => {
          return total + (disciplina.media || 0)
        }, 0)

        return parseFloat((totalNotas / disciplinasFiltradas.length).toFixed(1))
      }
    }
    return 0
  }

  private async mediaDisciplina(turma): Promise<number> {
    const disciplinas = await DisciplinasCursadas.query().where('codigo', turma.codigo)

    if (disciplinas.length === 0) return 0

    const totalNotas = disciplinas.reduce((total, disciplina) => {
      return total + (disciplina.media || 0)
    }, 0)

    return parseFloat((totalNotas / disciplinas.length).toFixed(1))
  }

  private async processTurmas(turmas, disciplinasCursadas, periodoAluno, eixosCount, userId, limiteTurno) {
    let turmasDisponiveis = await Promise.all(
      turmas.map(async (turma) => {
        // Verifica se a turma já foi cursada pelo usuário
        const discCursada = await this.discCursada(turma, disciplinasCursadas)
        if (discCursada) return null

        // Verifica se o usuário atende aos pré-requisitos da turma
        const atendePreRequisitos = await this.atendePreRequisitos(turma, disciplinasCursadas)
        if (!atendePreRequisitos) return null

        // Verifica se a turma atende aos requisitos de horario do aluno
        const contemLimiteTurno = limiteTurno.some((turno) =>
          turma.horario.toString().includes(turno)
        )

        if (contemLimiteTurno && !['TN756', 'TN757'].includes(turma.codigo)) return null; // isenta as disciplinas de orientação

        return {
          ...turma,
          periodoAtual: (await this.ePeriodoAluno(turma, periodoAluno)) ? 100 : 0,
          periodoAnteriorPreReq: (await this.obAnterioresPreReq(turma, periodoAluno)) ? 100 : 0,
          periodoAnterior: (await this.obAnteriores(turma, periodoAluno)) ? 100 : 0,
          complementaEixo: await this.complementaEixo(turma, eixosCount),
          indiceAprProfessor: await this.indiceAprProfessor(turma, userId),
          indiceAprDisciplina: await this.indiceAprDisciplina(turma),
          mediaProfessor: await this.mediaProfessor(turma, userId),
          mediaDisciplina: await this.mediaDisciplina(turma),
        }
      })
    )
    turmasDisponiveis = turmasDisponiveis.filter((turma) => turma !== null)
    return turmasDisponiveis
  }

  private calculaPesos(turmasDisponiveis) {
    // Pesos para cada critério
    const pesos = {
      periodoAtual: 1,
      periodoAnteriorPreReq: 0.8,
      periodoAnterior: 0.6,
      complementaEixo: 0.7,
      indiceAprProfessor: 0.5,
      indiceAprDisciplina: 0.5,
      mediaProfessor: 0.4,
      mediaDisciplina: 0.4,
    }

    turmasDisponiveis = turmasDisponiveis.map((turma) => {
      const {
        periodoAtual,
        periodoAnteriorPreReq,
        periodoAnterior,
        complementaEixo,
        indiceAprProfessor,
        indiceAprDisciplina,
        mediaProfessor,
        mediaDisciplina,
      } = turma

      let pesoTotal

      // Atribui peso 100 se o periodoAtual for verdadeiro
      if (periodoAtual > 0) {
        pesoTotal = 100
      } else {
        pesoTotal = parseFloat(
          (
            periodoAnteriorPreReq * pesos.periodoAnteriorPreReq +
            periodoAnterior * pesos.periodoAnterior +
            complementaEixo * pesos.complementaEixo +
            indiceAprProfessor * pesos.indiceAprProfessor +
            indiceAprDisciplina * pesos.indiceAprDisciplina +
            mediaProfessor * pesos.mediaProfessor +
            mediaDisciplina * pesos.mediaDisciplina
          ).toFixed(1)
        )
      }

      return { ...turma, pesoTotal }
    })

    // Encontrar o máximo peso total das turmas que não têm periodoAtual
    const maxPesoTotalSemPeriodoAtual = Math.max(
      ...turmasDisponiveis
        .filter((turma) => turma.periodoAtual === 0)
        .map((turma) => turma.pesoTotal || 0)
    )

    // Ajustar pesos proporcionalmente para garantir que as turmas com periodoAtual tenham 100%
    turmasDisponiveis = turmasDisponiveis.map((turma) => {
      if (turma.periodoAtual > 0) {
        return { ...turma, pesoTotal: 100 }
      } else if (maxPesoTotalSemPeriodoAtual > 0) {
        const ajusteProporcional = 100 / maxPesoTotalSemPeriodoAtual
        return {
          ...turma,
          pesoTotal: parseFloat((turma.pesoTotal * ajusteProporcional).toFixed(1)),
        }
      } else {
        return turma
      }
    })

    return turmasDisponiveis
  }

  private ajustarTurmasRecomendadas(turmasRecomendadas, turmasRestantes, numberOfDiscs) {
    const codigosTurmas = turmasRecomendadas.map((turma) => turma?.$attributes.codigo)
    const duplicatasCodigo = codigosTurmas.filter((codigo, index) => codigosTurmas.indexOf(codigo) !== index)

    numberOfDiscs += duplicatasCodigo.length

    if (turmasRecomendadas.length < numberOfDiscs) {
      const turmasAdicionais = turmasRestantes.slice(0, numberOfDiscs - turmasRecomendadas.length)
      turmasRecomendadas = [...turmasRecomendadas, ...turmasAdicionais]
      turmasRestantes = turmasRestantes.slice(turmasAdicionais.length)
    }

    return { turmasRecomendadas, turmasRestantes, numberOfDiscs }
  }

  private async ajustarTurmasNecessarias(turmasRecomendadasAux, turmasRestantesAux, cargaHorariaObrigatoriaTotal, cargaHorariaOptativaTotal) {
    let turmasRecomendadas: any[] = [];
    let turmasRestantes: any[] = [];

    async function processTurmas(turmas: any[], cargaHorariaObrigatoriaTotal: number, cargaHorariaOptativaTotal: number, turmasAux: any[], rec: boolean) {
      const alreadyProcessed = new Set();

      await Promise.all(turmas.map(async (turma) => {
        if (turma.$attributes.disciplinaId && !alreadyProcessed.has(turma.$attributes.codigo)) {
          const disciplina = await Disciplina.query().where('id', turma.$attributes.disciplinaId).first();
          if (disciplina) {
            let shouldAdd = false;
            if (disciplina.periodo > 0 && cargaHorariaObrigatoriaTotal >= disciplina.cargaHoraria) {
              shouldAdd = true;
              cargaHorariaObrigatoriaTotal -= disciplina.cargaHoraria;
              if (["TN756", "TN757"].includes(disciplina.codigo)) {
                cargaHorariaObrigatoriaTotal -= 120; // disciplina TCC I e II
              }
            } else if (disciplina.periodo < 0 && cargaHorariaOptativaTotal >= disciplina.cargaHoraria) {
              shouldAdd = true;
              cargaHorariaOptativaTotal -= disciplina.cargaHoraria;
            }

            if (shouldAdd) {
              turmasAux.push(turma);
              alreadyProcessed.add(turma.$attributes.codigo);

              // Adicionar outras turmas com o mesmo código
              turmas.forEach((otherTurma) => {
                if (otherTurma.$attributes.codigo === turma.$attributes.codigo && otherTurma !== turma && rec) {
                  turmasAux.push(otherTurma);
                  alreadyProcessed.add(otherTurma.$attributes.codigo);
                }
              });
            }
          }
        }
      }));
    }

    await processTurmas(turmasRecomendadasAux, cargaHorariaObrigatoriaTotal, cargaHorariaOptativaTotal, turmasRecomendadas, true);
    await processTurmas(turmasRestantesAux, cargaHorariaObrigatoriaTotal, cargaHorariaOptativaTotal, turmasRestantes, false);

    return { turmasRecomendadas, turmasRestantes }
  }

  private verificaChoque(turmasRecomendadas, turmasRestantes, numberOfDiscs) {
    let foundDuplicate = true

    while (foundDuplicate) {
      // Verifica duplicatas de horários
      const horariosTurmas = turmasRecomendadas.map((turma) => turma?.$attributes.horario)
      const horariosComuns = horariosTurmas.filter((horarios, index) => {
        return turmasRecomendadas.some((turma, i) => {
          if (
            i !== index &&
            turma?.$attributes.codigo !== turmasRecomendadas[index]?.$attributes.codigo
          ) {
            return turma?.$attributes.horario.some((horario) => horarios.includes(horario))
          }
          return false
        })
      })

      const numeroDuplicatasHorario = Math.floor(horariosComuns.length / 2)
      // Atualiza a lista de turmas se houver duplicatas
      if (turmasRecomendadas.length < numberOfDiscs + numeroDuplicatasHorario) {
        const turmasAdicionais = turmasRestantes.slice(0, numberOfDiscs + numeroDuplicatasHorario - turmasRecomendadas.length)
        turmasRecomendadas = [...turmasRecomendadas, ...turmasAdicionais]
        turmasRestantes = turmasRestantes.slice(turmasAdicionais.length)
      } else {
        foundDuplicate = false // Termina o loop se não encontrou mais duplicatas
      }
    }
    return { turmasRecomendadas, turmasRestantes }
  }

  private trataInput(data) {
    const numberOfDiscs = parseInt(data.numDisciplinas);
    let limiteTurno = ['M', 'T', 'N'];

    limiteTurno = data.manha ? limiteTurno.filter(item => item !== 'M') : limiteTurno;
    limiteTurno = data.tarde ? limiteTurno.filter(item => item !== 'T') : limiteTurno;
    limiteTurno = data.noite ? limiteTurno.filter(item => item !== 'N') : limiteTurno;

    return { numberOfDiscs, limiteTurno };
  }

  public async generate({ auth, request, view }: HttpContextContract) {
    const data = request.all();
    let { numberOfDiscs, limiteTurno } = this.trataInput(data);

    const anoAtual = 2024;
    const periodoAtual = 1;

    const user = await User.findOrFail(auth.user?.id);

    const anoLetivo = user.anoLetivo.split('.');
    const periodoAluno = (anoAtual - parseInt(anoLetivo[0])) * 2 + periodoAtual;

    const turmas = await Turma.query()
      .where('ano', anoAtual)
      .where('periodo', periodoAtual)
      .preload('professor', (professor) => {
        professor.select(['id', 'nome'])
      });

    // Busca as disciplinas cursadas pelo usuário
    const disciplinasCursadas = await DisciplinasCursadas.query()
      .where('user_id', user.id)
      .whereIn('situacao', ['CUMPRIU', 'APR', 'APRN', 'INCORP', 'CUMP']);

    // calculo de quantos horas o aluno precisa completar
    let cargaHorariaObrigatoriaTotal = 2280;
    let cargaHorariaOptativaTotal = 720;

    disciplinasCursadas.forEach((disciplina) => {
      // Verificando o tipo da disciplina
      if (disciplina.tipo === 'OB' || disciplina.tipo === "EQOB") {
        cargaHorariaObrigatoriaTotal -= disciplina.cargaHoraria || 0;
      } else if (disciplina.tipo === 'OP' || disciplina.tipo === "EQOP" || disciplina.tipo === 'EL') {
        cargaHorariaOptativaTotal -= disciplina.cargaHoraria || 0;
      }
    });

    let eixosCount = await this.verificaEixos(disciplinasCursadas);

    // Lista de turmas disponíveis após aplicar os filtros
    let turmasDisponiveis = await this.processTurmas(turmas, disciplinasCursadas, periodoAluno, eixosCount, user.id, limiteTurno);

    // Calcula o peso total para cada turma disponível
    turmasDisponiveis = this.calculaPesos(turmasDisponiveis);

    let turmasRecomendadas: any[] = [];
    let turmasRestantes: any[] = [];

    // Separar as turmas em duas listas: com periodoAtual e as restantes 
    if (turmasDisponiveis.length > numberOfDiscs) {
      turmasRecomendadas = turmasDisponiveis.filter((turma) => turma.periodoAtual > 0);
      turmasRestantes = turmasDisponiveis.filter((turma) => turma.periodoAtual === 0);

      // Ordenar as listas pelo peso total em ordem decrescente
      turmasRecomendadas.sort((a, b) => b.pesoTotal - a.pesoTotal);
      turmasRestantes.sort((a, b) => b.pesoTotal - a.pesoTotal);

      // Verifica se há turmas com o mesmo código na lista turmasRecomendadas
      ({ turmasRecomendadas, turmasRestantes, numberOfDiscs } = this.ajustarTurmasRecomendadas(turmasRecomendadas, turmasRestantes, numberOfDiscs));

      // Verifica se o aluno precisa da disciplina
      ({ turmasRecomendadas, turmasRestantes } = await this.ajustarTurmasNecessarias(turmasRecomendadas, turmasRestantes, cargaHorariaObrigatoriaTotal, cargaHorariaOptativaTotal));

      // Verifica se há turmas com choque de horarios
      ({ turmasRecomendadas, turmasRestantes } = this.verificaChoque(turmasRecomendadas, turmasRestantes, numberOfDiscs));
    } else {
      turmasRecomendadas = turmasDisponiveis;

      // Ordenar as listas pelo peso total em ordem decrescente
      turmasRecomendadas.sort((a, b) => b.pesoTotal - a.pesoTotal);

      // Verifica se o aluno precisa da disciplina
      ({ turmasRecomendadas, turmasRestantes } = await this.ajustarTurmasNecessarias(turmasRecomendadas, turmasRestantes, cargaHorariaObrigatoriaTotal, cargaHorariaOptativaTotal));
    }

    /* Exibir as turmas
    turmasRecomendadas.forEach((turmaDispon) => {
      console.log(turmaDispon?.$attributes.nome + ' | ' + turmaDispon?.$attributes.codigo + ' | ' + turmaDispon?.$attributes.turma + ' | ' +
        turmaDispon?.$attributes.horario + ' | ' + turmaDispon?.periodoAtual + ' | ' + turmaDispon?.periodoAnteriorPreReq + ' | ' +
        turmaDispon?.periodoAnterior + ' | ' + turmaDispon?.complementaEixo + ' | ' + turmaDispon?.indiceAprProfessor + ' | ' +
        turmaDispon?.indiceAprDisciplina + ' | ' + turmaDispon?.mediaProfessor + ' | ' + turmaDispon?.mediaDisciplina + ' | ' + turmaDispon?.pesoTotal)
    })

    console.log('----------------------------------------------------------------')
    // Exibir as turmas restantes
    turmasRestantes.forEach((turmaDispon) => {
      console.log(turmaDispon?.$attributes.nome + ' | ' + turmaDispon?.$attributes.codigo + ' | ' + turmaDispon?.$attributes.turma + ' | ' +
        turmaDispon?.$attributes.horario + ' | ' + turmaDispon?.periodoAtual + ' | ' + turmaDispon?.periodoAnteriorPreReq + ' | ' +
        turmaDispon?.periodoAnterior + ' | ' + turmaDispon?.complementaEixo + ' | ' + turmaDispon?.indiceAprProfessor + ' | ' +
        turmaDispon?.indiceAprDisciplina + ' | ' + turmaDispon?.mediaProfessor + ' | ' + turmaDispon?.mediaDisciplina + ' | ' + turmaDispon?.pesoTotal)
    })
    console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    */
    return view.render('disciplinas/recomendacao', {
      turmasRecomendadas,
      turmasRestantes,
      rec: true
    })
  }
}