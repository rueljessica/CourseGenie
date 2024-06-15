  import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Disciplina from './Disciplina'

export default class ConteudoProgramatico extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public disciplinaId: number

  @column()
  public unidade: string

  @column()
  public topicos: string[]

  @belongsTo(() => Disciplina)
  public disciplina: BelongsTo<typeof Disciplina>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
