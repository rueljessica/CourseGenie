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

cur.execute("""DROP table IF EXISTS Disciplinas""")
conn.commit()
# executing queries to create table disciplinas
cur.execute("""
    CREATE TABLE Disciplinas
    (
        id SERIAL PRIMARY KEY NOT NULL,
        nome TEXT NOT NULL,
        nucleo TEXT NOT NULL,
        codigo TEXT NOT NULL,
        periodo INT,
        creditos INT NOT NULL,
        carga_horaria TEXT NOT NULL,
        objetivo TEXT[] NOT NULL,
        ementa TEXT[] NOT NULL,
        bibliografia_basica TEXT[] NOT NULL,
        bibliografia_complementar TEXT[] NOT NULL
    )""")

# commit the changes
conn.commit()
print("Table Disciplinas Created successfully")
conn.commit()

cur.execute("""DROP table IF EXISTS Pre_Requisitos""")
# executing queries to create table
cur.execute("""
    CREATE TABLE Pre_Requisitos
    (
        id SERIAL PRIMARY KEY NOT NULL,
        disciplina_id INT NOT NULL,
        nome TEXT NOT NULL,
        codigo TEXT NOT NULL
    )""")

# commit the changes
conn.commit()
print("Table Pre_Requisitos Created successfully")

cur.execute("""DROP table IF EXISTS Unidades""")
conn.commit()

# executing queries to create table
cur.execute("""
    CREATE TABLE Unidades
    (
        id SERIAL PRIMARY KEY NOT NULL,
        disciplina_id INT NOT NULL,
        titulo TEXT NOT NULL,
        topicos TEXT[] NOT NULL
    )""")

# commit the changes
conn.commit()
print("Table Unidade Created successfully")

json_file = open(file='python_script/disciplinas_final.json', encoding="utf-8")

# Lendo o arquivo como Json.
data = json.load(json_file)

# Fechando o arquivo, visto que ele não é mais necessário.
json_file.close()

# Loop para percorrer todos os dados que estão na lista.
id = 1
id_pr = 1
id_u = 1
for values in data:
    nome = values['nome'].upper()
    nucleo = values['nucleo']
    codigo = values['codigo']

    try: 
        periodo = values['periodo']
    except:
        periodo = 0
    
    creditos = values['creditos']
    carga_horaria = values['carga_horaria']
    objetivo = str(set(values['objetivo'])).replace('\'', '\"')
    ementa = str(set(values['ementa'])).replace('\'', '\"')
    bibliografia_basica = str(set(values['bibliografia_basica'])).replace('\'', '\"')
    bibliografia_complementar = str(set(values['bibliografia_complementar'])).replace('\'', '\"')

    query = f'INSERT into Disciplinas (id, nome, nucleo, codigo, periodo, creditos, carga_horaria, objetivo, ementa, bibliografia_basica, bibliografia_complementar) values ({id}, \'{nome}\', \'{nucleo}\' ,\'{codigo}\', {periodo}, {creditos},\'{carga_horaria}\', \'{objetivo}\', \'{ementa}\', \'{bibliografia_basica}\', \'{bibliografia_complementar}\')'
    cur.execute(query)

    try:
        for pre_requisito in values['pre_requisito']:
            nome = pre_requisito['nome'].upper()
            codigo = pre_requisito['codigo']
            query_pr = f'INSERT into Pre_Requisitos (id, disciplina_id, nome, codigo) values ({id_pr}, {id}, \'{nome}\', \'{codigo}\')'
            cur.execute(query_pr)
            id_pr+=1
    except:
        print("não tem pre requisito: "+str(id))

    unidades = values['conteudo_programatico']
    for unidade in unidades['unidades']:
        titulo = unidade['unidade'].upper()
        if not unidade['topicos']:
            topicos = "{}"
        else:
            topicos = str(set(unidade['topicos'])).replace('\'', '\"')
            
        
        query_u = f'INSERT into Unidades (id, disciplina_id, titulo, topicos) values ({id_u}, {id}, \'{titulo}\', \'{topicos}\')'
        cur.execute(query_u)
        id_u+=1

    print("disciplina cadastrada com sucesso: " + nome + " Id: "+str(id))
    id+=1

conn.commit()
conn.close()