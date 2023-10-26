import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Disciplina from './Disciplina'

export default class DisciplinaPreRequisito extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public disciplinaId: number

  @column()
  public preRequisitoId: number

  // Define um relacionamento com o modelo 'Disciplina'
  @belongsTo(() => Disciplina, {
    localKey: 'disciplinaId',
    foreignKey: 'id',
  })
  public disciplina: BelongsTo<typeof Disciplina>

  // Define um relacionamento com o modelo 'Disciplina' para o pré-requisito
  @belongsTo(() => Disciplina, {
    localKey: 'preRequisitoId',
    foreignKey: 'id',
  })
  public preRequisito: BelongsTo<typeof Disciplina>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
