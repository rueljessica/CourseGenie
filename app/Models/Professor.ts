/* eslint-disable prettier/prettier */
import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import DisciplinasCursada from './DisciplinasCursada'

export default class Professor extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nome: string

  @column()
  public apelido: string

  @column()
  public email: string

  @column()
  public lattes: string

  @column()
  public sala: string

  @column()
  public departamento: string

  @column()
  public areasInteresse: string[]

  @column()
  public disciplinas: string[]

  @column()
  public descricao: string

  @hasMany(() => DisciplinasCursada)
  public disciplinasCursadas: HasMany<typeof DisciplinasCursada>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
