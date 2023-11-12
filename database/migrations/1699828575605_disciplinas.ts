/* eslint-disable prettier/prettier */
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  public async up() {
    this.schema.createTable('disciplinas', (table) => {
      table.increments('id').primary()
      table.string('nome', 255)
      table.string('codigo', 10).notNullable().unique()
      table.string('nucleo', 255)
      table.integer('periodo').notNullable()
      table.integer('creditos')
      table.integer('carga_horaria')
      table.specificType('objetivo', 'text[]').defaultTo('{}')
      table.specificType('ementa', 'text[]').defaultTo('{}')
      table.specificType('bibliografia_basica', 'text[]').defaultTo('{}')
      table.specificType('bibliografia_complementar', 'text[]').defaultTo('{}')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
    // Crie a tabela intermediária para o relacionamento muitos-para-muitos
    this.schema.createTable('disciplina_pre_requisitos', (table) => {
      table.increments('id').primary()
      table.integer('disciplina_id').unsigned().references('disciplinas.id').onDelete('CASCADE')
      table.integer('pre_requisito_id').unsigned().references('disciplinas.id').onDelete('CASCADE')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
    
    // Crie a tabela para conteúdo programático
    this.schema.createTable('conteudo_programaticos', (table) => {
      table.increments('id')
      table.integer('disciplina_id').unsigned().references('disciplinas.id').onDelete('CASCADE')
      table.string('unidade', 255).notNullable()
      table.specificType('topicos', 'text[]').defaultTo('{}')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable('disciplinas')
    this.schema.dropTable('disciplina_pre_requisitos')
    this.schema.dropTable('conteudo_programaticos')
    this.schema.dropTable('topicos')
  }
}
