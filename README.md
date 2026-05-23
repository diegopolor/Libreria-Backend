# Sistema de Gestión de Biblioteca

## Requerimientos Funcionales

### RF-01: Gestión de usuarios
El sistema debe permitir crear usuarios con los siguientes roles:
- Administrador
- Bibliotecario
- Cliente



### RF-02: Gestión de libros
El sistema debe permitir registrar libros con la siguiente información:
- Nombre del libro
- Categoría
- Nombre del autor
- Edición
- Nombre de editorial
- Fecha de publicación



### RF-03: Gestión de préstamos
El sistema debe permitir registrar préstamos de libros a usuarios incluyendo:
- Fecha de préstamo
- Fecha de devolución
- Nombre del libro
- Usuario al que fue prestado



### RF-04: Filtrado de libros
El sistema debe permitir filtrar libros por diferentes campos relevantes, tales como:
- Nombre
- Editorial
- Autor
- Categoría
- Edición



### RF-05: Ordenamiento de libros
El sistema debe permitir ordenar libros:
- Por fecha de publicación
- Alfabéticamente por nombre



### RF-06: Autenticación
El sistema debe implementar autenticación mediante tokens para el manejo de sesiones de usuario.



### RF-07: Control de permisos
El sistema debe limitar las funcionalidades según el rol del usuario:
- El administrador podrá gestionar usuarios y roles.
- El bibliotecario podrá registrar libros y gestionar préstamos.
- El cliente solo podrá consultar información disponible.



## Roles del Sistema

| Rol | Permisos |
|------|-----------|
| Administrador | Gestión de usuarios y roles |
| Bibliotecario | Gestión de libros y préstamos |
| Cliente | Consulta de información |



## Funcionalidades principales

- Gestión de usuarios
- Gestión de libros
- Gestión de préstamos
- Filtrado y búsqueda de libros
- Ordenamiento de catálogo
- Autenticación y autorización por roles
