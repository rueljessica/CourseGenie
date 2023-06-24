/* eslint-disable prettier/prettier */
import { DateTime } from 'luxon'
import { column, BaseModel} from '@ioc:Adonis/Lucid/Orm'

export default class Disciplina extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nome: string

  @column()
  public codigo: string

  @column()
  public periodo: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}