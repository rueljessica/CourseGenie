/* eslint-disable prettier/prettier */
import { DateTime } from 'luxon'
import { column, BaseModel, manyToMany, ManyToMany, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import ConteudoProgramatico from './ConteudoProgramatico'
import DisciplinaPreRequisito from './DisciplinaPreRequisito'

export default class Disciplina extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public codigo: string

  @column()
  public nucleo: string

  @column()
  public nome: string

  @column()
  public periodo: number

  @column()
  public creditos: number

  @column()
  public cargaHoraria: number

  @column()
  public objetivo: string[]

  @column()
  public ementa: string[]

  @column()
  public bibliografia_basica: string[]

  @column()
  public bibliografia_complementar: string[]

  @manyToMany(() => Disciplina, {
    localKey: 'id',
    pivotForeignKey: 'disciplina_id',
    //relatedKey: 'id',
    pivotRelatedForeignKey: 'pre_requisito_id',
    pivotTable: 'disciplina_pre_requisitos',
  })
  public preRequisitos: ManyToMany<typeof Disciplina>

  // Define o relacionamento um-para-muitos com a tabela 'disciplina_pre_requisito' para obter os pré-requisitos
  @hasMany(() => DisciplinaPreRequisito, {
    foreignKey: 'disciplina_id',
  })
  public preRequisitosRelacionados: HasMany<typeof DisciplinaPreRequisito>;

  @hasMany(() => ConteudoProgramatico)
  public conteudoProgramaticos: HasMany<typeof ConteudoProgramatico>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}