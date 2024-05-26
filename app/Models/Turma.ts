import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Professor from './Professor'
import Disciplina from './Disciplina'

export default class Turma extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public codigo: string

  @column()
  public nome: string

  @column()
  public ano: string

  @column()
  public periodo: string

  @column()
  public turma: string

  @column()
  public disciplinaId: number

  @column()
  public professorId: number | null

  @column()
  public horario: string[]

  @column()
  public local: string

  @column()
  public capacidade: number

  @belongsTo(() => Disciplina)
  public disciplina: BelongsTo<typeof Disciplina>

  @belongsTo(() => Professor)
  public professor: BelongsTo<typeof Professor>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
