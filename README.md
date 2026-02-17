
# CMS completo de artículos de Blog

## Despliegue del proyecto y storage

- Vercel

## Versión de Node.js

- 22.16.0

## Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto copiando `.env.template`:

```bash
cp .env.template .env
```

Configura las siguientes variables:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=wortise-cms
BLOB_READ_WRITE_TOKEN=your_blob_token_here
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Inicializar Base de Datos

Este comando creará todos los índices necesarios en MongoDB:

```bash
npm run db:init
```

Este script automáticamente:
- Conecta a MongoDB
- Crea índices en las colecciones: `users`, `authors`, `articles`
- Optimiza las consultas con índices compuestos y de texto completo

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

## Instalaciones de dependencias:

- Zod
- BetterAuth
- tRPC
- React Hook Form
- TanStack Query
- MongoDB
- Shadcn UI

## Funcionalidades principales

### Artículos

- CRUD de Artículos (solo para autores).
- Listado paginado de los artículos creados por el usuario.
- Vista de detalle de cada artículo, incluyendo el nombre del autor.

#### Página principal del CMS

- Listado de todos los autores registrados.
- Cantidad total de artículos publicados por cada autor.

#### Buscador (server-side)

- Búsqueda de artículos, filtrar por: título, texto del artículo, y nombre del autor.