## Requisitos
- [NodeJS ^14](https://nodejs.org/en/download)
- [NPM](https://www.npmjs.com/package/download)
- [PostgreSQL](https://www.postgresql.org/download/)

## Como executar a aplicação
- Passo 1: Clonar repositorio
```
git clone <link_do_github>
```

- Passo 2: instalar os frameworks utilizados no Frontend:
    - Tailwind
    - Flowbite
```
npm install -D tailwindcss
```

```
npm install flowbite
```
- Passo 3: Instalar dependências
```
npm install
```
- Passo 4: Executar migration
```
node ace migration:run
```
- Passo 5: Executar aplicação
```
npm run dev
```
