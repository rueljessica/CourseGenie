try:
    from psycopg2.extras import Json
    import psycopg2
    import json
except:
    from pip._internal import main as pip
    pip(['install', '--user', 'psycopg2'])
    pip(['install', '--user', 'psycopg2-binary'])
    from psycopg2.extras import Json
    import psycopg2
 
DB_NAME = "coursegenie"
DB_USER = "admin"
DB_PASS = "admin"
DB_HOST = "localhost"
DB_PORT = "5432"
conn = psycopg2.connect(database=DB_NAME,
                        user=DB_USER,
                        password=DB_PASS,
                        host=DB_HOST,
                        port=DB_PORT)
print("Database connected successfully")
 
cur = conn.cursor()

cur.execute("""DROP table IF EXISTS Professores""")
conn.commit()
# executing queries to create table disciplinas
cur.execute("""
    CREATE TABLE Professores
    (
        id SERIAL PRIMARY KEY NOT NULL,
        nome TEXT NOT NULL,
        sala INT NOT NULL,
        descricao TEXT NOT NULL
    )""")

# commit the changes
conn.commit()
print("Table Professores Created successfully")
conn.commit()

json_file = open(file='python_script/professores.json', encoding="utf-8")

# Lendo o arquivo como Json.
data = json.load(json_file)

# Fechando o arquivo, visto que ele não é mais necessário.
json_file.close()

# Loop para percorrer todos os dados que estão na lista.
id = 1
for values in data:
    nome = values['nome']
    sala = values['sala']
    descricao = values['descrição']

    query = f'INSERT into Professores (id, nome, sala, descricao) values ({id}, \'{nome}\', {sala},\'{descricao}\')'
    cur.execute(query)

    print("professor cadastrado com sucesso: " + nome + " Id: "+str(id))
    id+=1

conn.commit()
conn.close()