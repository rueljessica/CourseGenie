/* eslint-disable prettier/prettier */
import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Disciplina from './Disciplina'
import { rules, schema } from '@ioc:Adonis/Core/Validator'

export default class DisciplinasCursada extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nome: string

  @column()
  public codigo: string

  @column()
  public situacao: string

  @column()
  public ano: string

  @column()
  public professor: string

  @column()
  public media: number

  @column()
  public tipo: string

  @column()
  public userId: number

  @column()
  public equivalenciaId: number | null

  @column()
  public cargaHoraria: number | null

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Disciplina)
  public equivalencia: BelongsTo<typeof Disciplina>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  public static schema = schema.create({
    nome: schema.string(),
    codigo: schema.string(),
    situacao: schema.enum([
      'APR', 'APRN', 'CANC', 'DISP', 'MATRICULADO', 'MATR', 'REC',
      'REP', 'REPF', 'REPMF', 'REPN', 'REPNF', 'TRANCADO', 'TRANC',
      'TRANS', 'INCORP', 'CUMP'
    ]),
    ano: schema.string({}, [
      rules.regex(/^\d{4}\.\d$/)
    ]),
    professor: schema.string(),
    media: schema.number(),
    tipo: schema.enum(['AA', 'OB', 'EQOB', 'EQOP', 'OP', 'EL']),
    cargaHoraria: schema.number.optional([
      rules.requiredWhen('tipo', '=', 'EL')
    ]),
    equivalenciaId: schema.number.optional([
      rules.requiredWhen('tipo', '=', ['EQOB', 'EQOP'])
    ])
  })
}
