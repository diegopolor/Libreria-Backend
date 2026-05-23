# Sistema de Gestión de Biblioteca

## Requerimientos Funcionales

- Registrar usuarios con roles de administrador, bibliotecario y cliente.

- Permitir la creación y gestión de libros dentro del catálogo, incluyendo:
  - Nombre del libro
  - Categoría
  - Autor
  - Edición
  - Editorial
  - Fecha de publicación

- Gestionar préstamos de libros a usuarios registrados, almacenando:
  - Fecha de préstamo
  - Fecha de devolución
  - Libro prestado
  - Usuario asociado al préstamo

- Filtrar libros por distintos criterios como:
  - Nombre
  - Autor
  - Editorial
  - Categoría
  - Edición

- Ordenar libros por:
  - Fecha de publicación
  - Orden alfabético

- Implementar autenticación mediante tokens para el manejo de sesiones.

- Restringir funcionalidades según el rol del usuario:
  - El administrador podrá gestionar usuarios y roles.
  - El bibliotecario podrá registrar libros y préstamos.
  - El cliente únicamente podrá consultar información disponible.

---

## Roles del Sistema

| Rol | Funciones |
|------|------------|
| Administrador | Gestión de usuarios y roles |
| Bibliotecario | Gestión de libros y préstamos |
| Cliente | Consulta de información |

---

## Funcionalidades Principales

- Gestión de usuarios
- Gestión de libros
- Gestión de préstamos
- Filtrado y búsqueda de libros
- Ordenamiento de catálogo
- Autenticación y autorización por roles
