
# CMS completo de artículos de Blog

## Despliegue del proyecto y storage

- Vercel

## Versión de Node.js

- 22.16.0

## Funcionalidades principales

### Artículos

- CRUD de Artículos (solo para autores).
- Listado paginado de los artículos creados por el usuario.
- Vista de detalle de cada artículo, incluyendo el nombre del autor.

#### Página principal del CMS

- Listado de todos los autores registrados.
- Cantidad total de artículos publicados por cada autor.

#### Buscador (server-side)

- Búsqueda de artículos, filtro por: título, texto del artículo, y nombre del autor.

## Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto copiando `.env.template`:


Configura las siguientes variables:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=wortise-cms
BLOB_READ_WRITE_TOKEN=your_blob_token_here
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Inicializar Base de Datos

Este comando creará todas las colecciones y los índices necesarios en MongoDB:

```bash
npm run db:init
```

Este script realiza las siguientes acciones:
- Conecta a MongoDB
- Crea las colecciones: `users`, `sessions`, `accounts`, `authors`, `articles`
- Crea índices en las colecciones: `users`, `authors`, `articles`
- Optimiza las consultas con índices compuestos y de texto completo

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

### Instalaciones de dependencias:

- Zod
- BetterAuth
- tRPC
- React Hook Form
- TanStack Query
- MongoDB
- Shadcn UI
- Zustand

### Uso de Inteligencia Artificial

Este proyecto fue desarrollado con asistencia de **GitHub Copilot (modelo Claude Opus 4.6)**, utilizado de forma controlada y consciente como herramienta colaborativa a lo largo de todo el proceso.

La IA no generó el proyecto de forma autónoma. Cada decisión de arquitectura, diseño y lógica fue dirigida y validada manualmente. Se utilizó como apoyo para:

- Scaffolding inicial de archivos y configuraciones.
- Implementación guiada de funcionalidades (CRUD, autenticación, búsqueda, subida de imágenes).
- Refactorización y limpieza de código (deduplicación de utilidades, extracción de schemas, creación de hooks reutilizables).
- Detección de errores y debugging durante el despliegue a producción.
- Optimización de índices de MongoDB.

**Formato de los prompts:** conversacionales, en español, iterativos. Se describía la intención o el problema en lenguaje natural, se revisaba la propuesta generada, y se ajustaba en pasos sucesivos. No se utilizaron prompts predefinidos ni templates; la interacción fue orgánica, similar a trabajar en pair programming con otro desarrollador.

#### Ejemplos de prompts utilizados

***'Perfecto. Como verás, he dejado algunos TODO pendientes en auth-form.tsx. La idea sería manejar los forms utilizando React Hook Form, para el caso de auth ya he definido un schema de validación. Y también hay que definir que cuando se hace sign up, debe crear también un author en mi base de datos. Y posteriormente, la información del usuario debe ser guardada en un estado global. He instalado Zustand pero no he hecho la configuración. No se que tan complejo será esto porque nunca utilicé Zustand pero si acomplejiza mucho podríamos usar Context.'***

***'Ok bien, sigamos ordenando un poco el código. Como verás, el schema de validación para auth lo separé en una carpeta schemas dentro de auth, en un archivo aparte. Podríamos hacer lo mismo con los schemas usados en articles? y en caso de haber otra parte de la aplicación utilizando un schema para validar el form, hacer lo mismo.'***

***'Bien, ahora necesito que me ayudes con la UI de artículos. Esta vista debe mostrar un listado de artículos pero solo los que sean del autor (usuario logeado). Esta vista debe permitir realizar un CRUD de artículos. Cada artículo del listado debe mostrar título, texto, imagen de portada, autor y fecha de creación. Este listado debe estar paginado y también debe haber una vista de detalle de cada artículo, incluyendo el nombre del autor.'***