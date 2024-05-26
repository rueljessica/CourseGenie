import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'turmas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('codigo', 10).notNullable()
      table.string('nome', 80).notNullable()
      table.string('ano', 4).notNullable()
      table.string('periodo', 1).notNullable()
      table.string('turma', 2)
      table.integer('disciplina_id').unsigned().references('id').inTable('disciplinas').onDelete('CASCADE');
      table.integer('professor_id').unsigned().references('id').inTable('professors').onDelete('CASCADE');
      table.specificType('horario', 'text[]').defaultTo('{}')
      table.string('local', 500)
      table.integer('capacidade').notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
