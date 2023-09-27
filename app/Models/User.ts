/* eslint-disable prettier/prettier */
import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import DisciplinasCursada from './DisciplinasCursada'
import { column, beforeSave, BaseModel, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public avatar: string

  @column()
  public historico: string

  @column({ columnName: 'nome_completo' })
  public nomeCompleto: string

  @column()
  public nacionalidade: string

  @column()
  public rg: string

  @column()
  public cpf: string

  @column({ columnName: 'data_nascimento' })
  public dataNascimento: string

  @column({ columnName: 'prazo_conclusao' })
  public prazoConclusao: string

  @column()
  public status: string

  @column()
  public ira: number

  @column({ columnName: 'ano_letivo' })
  public anoLetivo: string

  @column()
  public matricula: string

  @hasMany(() => DisciplinasCursada)
  public disciplinas: HasMany<typeof DisciplinasCursada>

  @column()
  public rememberMeToken: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}