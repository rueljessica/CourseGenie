/* eslint-disable prettier/prettier */
import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Disciplina from './Disciplina'

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
  public equivalenciaId: number

  @column()
  public cargaHoraria: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Disciplina)
  public equivalencia: BelongsTo<typeof Disciplina>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
