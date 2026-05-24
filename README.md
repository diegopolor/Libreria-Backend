# Libreria-Front

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
