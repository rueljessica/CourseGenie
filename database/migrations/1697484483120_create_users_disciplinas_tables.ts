/* eslint-disable prettier/prettier */
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {

  public async up() {
    this.schema.createTable('users', (table) => {
      table.increments('id').primary()
      table.string('name', 255).notNullable().unique()
      table.string('email', 255).notNullable().unique()
      table.string('password', 180).notNullable()
      table.string('avatar').nullable()
      table.string('historico').nullable()
      table.string('remember_me_token').nullable()
      table.string('nome_completo', 255);
      table.string('nacionalidade', 255);
      table.string('rg', 255);
      table.string('cpf', 20);
      table.string('data_nascimento', 20);
      table.string('prazo_conclusao', 255);
      table.string('status', 20);
      table.float('ira');
      table.string('ano_letivo', 20);
      table.string('matricula', 20);
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })

    this.schema.createTable('disciplinas_cursadas', (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.string('nome', 255).notNullable();
      table.string('codigo', 255).notNullable();
      table.string('situacao', 255);
      table.string('ano', 255);
      table.string('professor', 255);
      table.float('media');
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable('disciplinas_cursadas')
    this.schema.dropTable('users')
  }
}