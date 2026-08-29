# PawReminder

Aplicación móvil para gestionar recordatorios de salud y cuidados de perros.

## Objetivo

PawReminder tiene como objetivo ayudar a llevar un control claro de los tratamientos preventivos y de cuidado de mascotas, con recordatorios basados en fechas y estados de vencimiento.

El proyecto ya cuenta con una base funcional local para gestionar mascotas y tratamientos. La intención actual es estabilizar la experiencia, completar validaciones de flujo y preparar mejoras de producto y publicación.

## Stack

- React Native con Expo
- TypeScript
- Expo Router
- Tamagui
- TanStack Query
- React Hook Form y Zod
- Expo Notifications
- AsyncStorage / servicios de persistencia abstraídos
- Jest y React Native Testing Library
- ESLint y Prettier

## Requisitos

- Node.js 20.19.4 o superior
- npm 10 o superior
- Expo Go en un dispositivo físico o Android Studio para emulador

## Instalación

```bash
nvm use
npm install
```

## Ejecución local

```bash
npm start
npm run android
npm run ios
npm run web
```

## Estructura principal

```text
app/                 Rutas y pantallas de la aplicación
src/components/      Componentes reutilizables
src/lib/             Lógica de dominio, hooks y utilidades
src/services/        Servicios de base de datos, notificaciones y calendario
src/theme/           Tokens y estilos
src/types/           Modelos de dominio
src/utils/           Utilidades puras
src/test/            Configuración común de pruebas
```

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm start` | Inicia Metro/Expo |
| `npm run android` | Ejecuta la app en Android |
| `npm run ios` | Ejecuta la app en iOS |
| `npm run web` | Ejecuta versión web |
| `npm run typecheck` | Valida TypeScript sin compilar |
| `npm run lint` | Ejecuta ESLint |
| `npm run format` | Verifica formato con Prettier |
| `npm test` | Ejecuta pruebas |

## Estado verificado del proyecto

A fecha de revisión actual, este proyecto ya incluye funcionalidad real en varias áreas:

### Implementado y verificado

- [x] Gestión de mascotas
  - crear, editar y eliminar mascotas
  - pantalla principal con listado de mascotas
  - detalle de mascota

- [x] Gestión de tratamientos
  - crear tratamiento
  - editar tratamiento
  - eliminar tratamiento
  - cálculo de próxima fecha de aplicación
  - lógica de estados de tratamiento: `upcoming`, `today`, `overdue`

- [x] Registro de historial
  - log de aplicaciones realizadas
  - marcado de tratamientos como aplicados

- [x] Notificaciones
  - programación de recordatorios relacionados al tratamiento
  - cancelación de notificaciones al editar o eliminar

- [x] UI y flujo principal
  - home con estado de cada mascota
  - detalle de tratamientos por mascota
  - modal para registrar tratamiento aplicado

- [x] Base técnica
  - Expo Router
  - TanStack Query
  - servicios desacoplados
  - diseño con tokens y estilos centralizados
  - pruebas unitarias para utilidades y servicios clave

### Pendiente / en mejora

- [x] validación real en dispositivos físicos Android e iOS
- [x] revisión de permisos y comportamiento de notificaciones en entorno real
- [x] mejorar estados de carga, error y vacío
- [ ] completar cobertura de pruebas del flujo completo
- [x] mejorar validación de fechas y reglas del dominio
- [x] calendario de tratamientos
- [x] fotos de mascotas
- [ ] sincronización en la nube / usuario
- [ ] publicación en tiendas

## Fases del proyecto

### Fase 0: preparación técnica
- [x] configuración base del proyecto
- [x] arquitectura inicial
- [x] tokens y diseño
- [x] herramientas de calidad

### Fase 1: persistencia e infraestructura
- [x] almacenamiento local
- [x] servicios desacoplados
- [x] consultas apoyadas por React Query

### Fase 2: MVP funcional local
- [x] CRUD de mascotas
- [x] CRUD de tratamientos
- [x] cálculo y visualización de estados
- [x] historial y aplicación de tratamientos
- [x] notificaciones locales

### Fase 3: validación y estabilización
- [x] validación real en dispositivos
- [x] limpieza de flujos y errores
- [ ] pruebas end-to-end y regresión

### Fase 4: mejoras de producto
- [x] calendario
- [ ] administración avanzada de recordatorios
- [ ] soporte para más tipos de cuidado

### Fase 5: publicación
- [ ] sincronización en la nube
- [ ] despliegue de producción
- [ ] App Store / Google Play

## Estado actual del proceso

El proyecto se encuentra en una etapa de MVP funcional local con calendario mensual y fotos locales de mascotas. La prioridad actual es ampliar las pruebas de regresión del flujo principal.

## Registro de evolución

Este registro sirve como historial formal del progreso del proyecto. Cada actualización debe documentar la fecha, el bloque completado, la validación asociada y el siguiente paso pendiente.

### 2026-08-29

- [x] Se agregaron estados explícitos de carga, error y reintento en Inicio, detalle de mascota e historial.
- [x] Validado: TypeScript, ESLint y 36 pruebas unitarias ejecutadas correctamente; Prettier verificado en los archivos modificados.
- [x] Se revisaron las notificaciones y permisos en dispositivos físicos Android e iOS, y se configuró el canal de Android para recordatorios de tratamientos.
- [x] Se validaron fechas de calendario y el rango de anticipación de los recordatorios en el formulario de tratamientos.
- [x] Se agregó un calendario mensual navegable con los tratamientos programados y su estado de vencimiento.
- [x] Validado: TypeScript, ESLint y 46 pruebas unitarias ejecutadas correctamente.
- [x] Se corrigió la programación de notificaciones en Android para usar explícitamente el canal `treatment-reminders` en cada trigger.
- [x] Validado: `npm test -- --runInBand src/services/notifications/notification-service.test.ts`, `npm run lint -- src/services/notifications/notification-service.ts src/services/notifications/notification-service.test.ts` y `npm run typecheck`.
- [x] Se habilitó la selección, previsualización y persistencia local de fotos de mascotas desde la galería.
- [x] Validado: configuración de Expo, TypeScript, ESLint y 49 pruebas unitarias ejecutadas correctamente.
- [ ] Siguiente paso pendiente: ampliar las pruebas de regresión del flujo principal.

## Evolución por sprint

### Sprint 1: base técnica y dominio

- [x] configuración inicial del proyecto
- [x] arquitectura base
- [x] modelo de dominio para mascotas y tratamientos
- [x] tokenización visual y estructura principal
- [x] servicios de persistencia y notificaciones desacoplados

### Sprint 2: flujo principal de MVP

- [x] creación, edición y eliminación de mascotas
- [x] creación, edición y eliminación de tratamientos
- [x] cálculo de fechas y estados (`upcoming`, `today`, `overdue`)
- [x] historial de aplicaciones y marcado de tratamientos aplicados
- [x] listado principal con estado de urgencia por mascota

### Sprint 3: validación y estabilización

- [x] validación real en dispositivos Android e iOS
- [x] revisión final de notificaciones locales
- [x] mejora de UX para carga, error y vacíos
- [ ] pruebas de regresión del flujo principal

## Backlog + Done (visual)

### Backlog

| Prioridad | Bloque | Estado |
| --- | --- | --- |
| Alto | Validación real en Android e iOS | Completado |
| Alto | Revisión de permisos y notificaciones | Completado |
| Medio | Mejorar estados de carga, error y vacío | Completado |
| Medio | Pruebas de regresión del flujo principal | Pendiente |
| Medio | Validación de fechas y reglas del dominio | Completado |
| Bajo | Calendario de tratamientos | Completado |
| Bajo | Fotos de mascotas | Completado |
| Bajo | Sincronización en la nube / usuario | Pendiente |
| Bajo | Publicación en tiendas | Pendiente |

### Done

| Bloque | Resultado | Validado |
| --- | --- | --- |
| Base técnica | Proyecto inicial configurado y operativo | Revisión de código y estructura |
| Dominio de mascotas | CRUD funcionando | Código y arquitectura |
| Dominio de tratamientos | CRUD, fechas y estados funcionando | Código y pruebas de utilidades |
| Historial de tratamiento | Registro y marcado de aplicación | Revisión del flujo principal |
| Notificaciones | Programación y cancelación de recordatorios | Revisión de servicios |
| Home y estado visual | Indicadores por mascota según urgencia | Revisión del flujo de UI |
| Calendario de tratamientos | Vista mensual y tratamientos programados | TypeScript, ESLint y pruebas unitarias |
| Fotos de mascotas | Selección y persistencia local desde galería | Revisión de código |

## Plantilla de update diario/semanal

```text
### Fecha: YYYY-MM-DD

#### Objetivo del bloque
- <qué se buscaba resolver>

#### Trabajo completado
- [x] <tarea completada>
- [x] Validado: <qué se verificó>

#### Siguiente paso pendiente
- [ ] <siguiente bloque de trabajo>

#### Riesgos o bloqueadores
- <si aplica>
```

### Patrón obligatorio de actualización

- [x] Tarea completada
- [x] Validado: breve nota de verificación
- [ ] Siguiente paso pendiente: descripción concreta

## Cómo mantener este README actualizado

Cada vez que se complete una funcionalidad o se cierre un bloque de trabajo, se debe actualizar esta sección siguiendo este patrón:

1. mover la tarea desde “pendiente” a “implementado”
2. añadir una breve nota del resultado tangible
3. registrar si fue validado en pruebas o en dispositivo real
4. dejar el siguiente bloque de trabajo pendiente con claridad
5. añadir entrada en “Registro de evolución” con la fecha correspondiente

Ejemplo:

- [x] Registro de tratamiento aplicado desde la pantalla de detalle
- [x] Validado con pruebas de hook y flujo de notificación
- [ ] Revisar comportamiento real en Android con permisos de notificación

## Convenciones Git

Los commits siguen Conventional Commits y se escriben en español, por ejemplo:

```text
feat: agrega gestión de tratamientos
fix: corrige estado de vencimiento del tratamiento
chore: actualiza documentación del README
```
