# Sistema de Gestión de Biblioteca

## Requisitos Previos

- [Node.js](https://nodejs.org/) v18 o superior
- [npm](https://www.npmjs.com/) v9 o superior
- [Docker](https://www.docker.com/) y Docker Compose (para la base de datos o despliegue completo)

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Biblioteca-Backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar el archivo de ejemplo y completar los valores:

```bash
cp .env.example .env
```

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto en que corre el servidor | `5000` |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | `postgresql://user:pass@localhost:5432/biblioteca` |
| `JWT_SECRET` | Clave secreta para tokens de acceso | `mi_clave_secreta` |
| `JWT_REFRESH_SECRET` | Clave secreta para tokens de refresco | `mi_clave_refresco` |
| `JWT_EXPIRES_IN` | Expiración del token de acceso | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Expiración del token de refresco | `7d` |
| `NODE_ENV` | Entorno de ejecución | `development` |

### 4. Levantar la base de datos con Docker

```bash
docker-compose up -d db
```

### 5. Ejecutar migraciones y generar el cliente Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 6. (Opcional) Poblar la base de datos con datos iniciales

```bash
npm run prisma:seed
```

### 7. Iniciar el servidor

```bash
# Modo desarrollo (con recarga automática)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:5000`.

---

### Despliegue con Docker Compose (completo)

Para levantar tanto la base de datos como el backend en contenedores:

```bash
docker-compose up -d
```

El backend quedará expuesto en `http://localhost:5001`.

---

## Requerimientos Funcionales

### RF-01: Gestión de Usuarios y Roles
- **Descripción:** Permitir al sistema registrar usuarios asignando credenciales únicas y perfiles determinados (Administrador, Bibliotecario, Cliente).
- **Criterio de Aceptación:** Un usuario con rol de Administrador puede cambiar el rol de otros usuarios. El sistema debe impedir accesos no autorizados.

### RF-02: Gestión de Libros dentro del Catálogo
- **Descripción:** Permitir la creación, lectura, actualización y eliminación (CRUD) de libros en el inventario.
- **Campos Obligatorios de Almacenamiento:**
  - Nombre del libro
  - Categoría / Género
  - Autor(es)
  - Edición
  - Editorial
  - Fecha de publicación
- **Criterio de Aceptación:** El sistema no debe permitir el registro de un libro si falta alguno de los metadatos obligatorios.

### RF-03: Gestión y Almacenamiento de Préstamos
- **Descripción:** Administrar el flujo de salida y retorno de los libros a los usuarios registrados en el sistema.
- **Campos Obligatorios de Almacenamiento:**
  - Fecha de préstamo
  - Fecha de devolución (límite/real)
  - Libro prestado (ID/Código único)
  - Usuario asociado al préstamo
- **Criterio de Aceptación:** Si un libro ya se encuentra en estado "Prestado", el sistema debe bloquear cualquier intento de nueva asignación hasta que se registre su devolución.

### RF-04: Filtrado y Búsqueda Avanzada de Libros
- **Descripción:** Proveer herramientas de búsqueda eficientes para optimizar la experiencia de consulta en el catálogo.
- **Criterios de Filtrado:** Nombre, Autor, Editorial, Categoría y Edición.
- **Criterio de Aceptación:** El sistema debe retornar coincidencias exactas o parciales según los parámetros ingresados, visibles para todos los roles (incluyendo Clientes).

### RF-05: Ordenamiento de Catálogo
- **Descripción:** Permitir la organización visual de los libros en los paneles de visualización.
- **Criterios de Orden:** Fecha de publicación y Orden alfabético (A-Z / Z-A).
- **Criterio de Aceptación:** El orden se debe aplicar de manera inmediata sobre los resultados de la consulta activa.

### RF-06: Autenticación y Autorización por Roles (Seguridad)
- **Descripción:** Implementar un mecanismo de seguridad mediante la generación de tokens para el manejo estricto de sesiones activas.
- **Criterio de Aceptación:** El token de sesión debe expirar tras un periodo de inactividad. Los endpoints y vistas del software se deben restringir dinámicamente según el rol decodificado en el token (vistas de administración ocultas para perfiles tipo Cliente).
