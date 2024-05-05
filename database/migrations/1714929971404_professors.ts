import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'professors'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nome', 50).unique().notNullable()
      table.string('apelido', 20).unique().notNullable()
      table.string('email', 255).unique()
      table.string('lattes', 255).unique()
      table.string('sala')
      table.string('departamento', 5).notNullable()
      table.specificType('areas_interesse', 'text[]').defaultTo('{}')
      table.specificType('disciplinas', 'text[]').defaultTo('{}')
      table.text('descricao')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
