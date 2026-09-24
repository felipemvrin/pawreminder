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

### Animaciones e interacciones

- `lottie-react-native` para animaciones JSON opcionales y `moti`/Reanimated para fallbacks y microinteracciones.
- `expo-haptics` para feedback no bloqueante en acciones importantes.
- `react-native-gesture-handler` está preparado en el layout raíz para interacciones táctiles.
- Todas las animaciones deben consultar `useReducedMotion()` y ofrecer una versión estática.
- Para agregar un Lottie: coloca el JSON con un nombre aprobado en `assets/animations/`, registra su fuente en `src/components/animation/registry.ts` y completa autor, fuente, licencia y atribución en `ASSETS_LICENSES.md`.

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

### Preparación para TestFlight

- [x] política de privacidad publicada en Cloudflare Pages: https://pawreminder.pages.dev
- [x] identificador iOS `com.felipemvrin.pawreminder` y versión inicial `1.0.0 (1)` configurados
- [x] perfiles EAS de desarrollo, preview y producción agregados en `eas.json`
- [x] variables públicas de Supabase documentadas en `.env.example`
- [x] crear y vincular el proyecto EAS con la cuenta de Expo
- [x] añadir icono opaco para la app y splash desde los assets de `paw-reminder`
- [ ] desbloquear el Apple ID y configurar Apple Developer/App Store Connect
- [x] ejecutar build iOS de producción y subirlo a TestFlight

La build pasa actualmente `npm run typecheck`, `npm run lint` y `npm test -- --runInBand` (56 pruebas). El build `1.0.0 (2)` fue subido correctamente a App Store Connect. La política de privacidad pública está disponible en https://pawreminder.pages.dev.

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
- [x] administración avanzada de recordatorios
- [x] soporte para más tipos de cuidado
- [x] dashboard de seguimiento preventivo por mascota
- [ ] calendario interactivo con detalle y filtros
- [ ] historial ampliado con notas y resumen para veterinario
- [ ] experiencia inicial y estados vacíos orientados a acciones
- [ ] adaptación y validación de la experiencia en iPad
- [x] microinteracciones de presión, entrada escalonada y feedback háptico
- [x] swipe accesible para marcar tratamientos como aplicados
- [x] componente ProgressRing preparado para el dashboard
- [x] onboarding opcional de tres pantallas con persistencia local

### Fase 5: publicación
- [ ] sincronización en la nube
- [ ] despliegue de producción
- [ ] App Store / Google Play
- [ ] superar la revisión de funcionalidad mínima de App Store (Guideline 4.2)

## Estado actual del proceso

El proyecto se encuentra en una etapa de MVP funcional local con calendario mensual, fotos locales, administración de recordatorios y soporte para vacunas u otros cuidados. La build `1.0.0 (4)` fue rechazada por App Review bajo Guideline 4.2 debido a funcionalidad mínima percibida. La prioridad actual es ampliar el valor visible de la app con un dashboard de seguimiento preventivo, un calendario más interactivo, un historial útil para consultas veterinarias y una experiencia validada en iPad antes de generar una nueva build para revisión. El dashboard de seguimiento ya evita mostrar conteos transitorios incorrectos mientras carga los tratamientos por mascota.

## Registro de evolución

Este registro sirve como historial formal del progreso del proyecto. Cada actualización debe documentar la fecha, el bloque completado, la validación asociada y el siguiente paso pendiente.

### 2026-09-24

- [x] Se revisó el rechazo de App Review de la build `1.0.0 (4)` bajo Guideline 4.2 por funcionalidad mínima percibida.
- [x] Validado: se contrastó la observación de Apple con las funciones existentes de mascotas, tratamientos, calendario, historial, fotos y notificaciones.
- [x] Se actualizó el mapa de ruta para priorizar el valor de producto antes de una nueva entrega a revisión.
- [x] Validado: las nuevas tareas quedaron separadas de las funcionalidades ya implementadas y ordenadas por impacto en la revisión.
- [x] Se corrigió el modal de confirmación rápida para celebrar y cerrarse solo después de registrar el tratamiento correctamente.
- [x] Validado: se ajustaron las pruebas del modal y del hook de quick action para cubrir éxito, fallo y dismiss diferido.
- [x] Se agregaron estados vacíos reutilizables con acciones, animaciones de carga y una animación sutil para errores.
- [x] Validado: typecheck, ESLint y suite completa de Jest pasan después de añadir la prueba de `EmptyState`.
- [x] Se ocultó de accesibilidad el fallback decorativo de `PawAnimation` para evitar que los lectores de pantalla anuncien nombres internos de estados vacíos y carga.
- [x] Validado: `npm run lint` y `npm test -- --runTestsByPath src/components/animation/PawAnimation.test.tsx src/components/query-state.test.tsx src/components/empty-state.test.tsx`.
- [x] Se agregaron microinteracciones de presión, entrada escalonada para tarjetas, feedback háptico, pulso de vencidos y animación del avatar al cambiar la foto.
- [x] Validado: `npm run typecheck`, `npm run lint` y `npm test -- --runInBand`; 15 suites y 66 pruebas pasan.
- [x] Se corrigió `AnimatedPressable` para usar un componente animado real de Reanimated y asegurar que la escala al presionar se aplique en ejecución.
- [x] Validado: `npm run typecheck`, `npm run lint -- src/components/animated-pressable.tsx src/components/animated-pressable.test.tsx` y `npm test -- --runTestsByPath src/components/animated-pressable.test.tsx`.
- [x] Se agregó swipe accesible en tarjetas de tratamiento para marcar aplicado y se bloqueó la acción mientras el registro sigue en curso para evitar duplicados de historial y notificaciones.
- [x] Validado: `npm run typecheck`, `npm run lint` y `npm test -- --runInBand`; 17 suites y 70 pruebas pasan.
- [x] Se agregó `ProgressRing` aislado para mostrar cuidados al día con SVG, animación Reanimated y modo reducido estático; todavía no está conectado al dashboard.
- [x] Validado: `npm run typecheck`, `npm run lint` y `npm test -- --runInBand`; 18 suites y 72 pruebas pasan.
- [x] Se reforzó `ProgressRing` para normalizar valores inválidos/negativos y evitar estados accesibles inconsistentes en casos límite.
- [x] Validado: `npm run lint` y `npm test -- --runTestsByPath src/components/progress-ring.test.tsx`.
- [x] Se agregó onboarding opcional de tres pantallas con fallback de `PawAnimation`, indicador, acciones Continuar/Saltar y persistencia mediante el servicio de almacenamiento.
- [x] Validado: `npm run typecheck`, `npm run lint` y `npm test -- --runInBand`; 20 suites y 77 pruebas pasan.
- [x] Se robusteció el onboarding para manejar fallos de lectura/persistencia sin rechazos no controlados y evitar envíos duplicados al completar.
- [x] Se consolidó la carga del dashboard preventivo para reutilizar una sola consulta por mascota y evitar mostrar `0 de 0` mientras los tratamientos siguen cargando o fallan.
- [x] Validado: `npm run lint`, `npm run typecheck` y `npm test -- --runInBand --runTestsByPath src/lib/hooks/use-treatments.test.tsx src/lib/treatment-status.test.ts`.
- [ ] Siguiente paso pendiente: ampliar la cobertura de integración del home para estados del dashboard y navegación principal.
- [x] Validado: `npm run lint -- src/components/onboarding.tsx src/components/onboarding.test.tsx` y `npm test -- --runTestsByPath src/components/onboarding.test.tsx src/services/storage/onboarding-service.test.ts`; 7 pruebas pasan.
- [x] Se conectó `ProgressRing` a un dashboard de cuidados por mascota con conteo de tratamientos activos al día, próximos y vencidos.
- [x] Validado: `npm run typecheck`, `npm run lint` y `npm test -- --runInBand`; 20 suites y 81 pruebas pasan.
- [ ] Siguiente paso pendiente: validar visualmente el dashboard y onboarding en Expo Go antes de preparar la siguiente build.

### 2026-09-21

- [x] Se publicó la política de privacidad bilingüe en Cloudflare Pages: https://pawreminder.pages.dev.
- [x] Validado: la URL pública respondió HTTP 200.
- [ ] Siguiente paso pendiente: completar en App Store Connect la URL de privacidad, los metadatos y el precio para enviar la versión a revisión.
- [x] Se corrigió el asset del icono principal para iOS/TestFlight usando `paw-reminder-icon.png` sin canal alfa y se mantuvo `paw-reminder.png` como splash.
- [x] Validado: `npx expo config --type public --json`, `npm run typecheck`, `npm run lint` y `npm test -- --runInBand`; además el PNG generado quedó en formato RGB opaco.
- [x] Se inició el build iOS de producción en EAS y se validó la configuración de cifrado estándar/exento.
- [x] Validado: el proyecto pasó la preparación EAS, pero Apple rechazó el inicio de sesión con el error `-20209` (cuenta bloqueada por seguridad); no se creó un build remoto.
- [x] Se generó el build iOS de producción `1.0.0 (2)` y se subió correctamente a App Store Connect.
- [x] Validado: EAS registró el build como `finished` y App Store Connect confirmó la carga del binario.
- [ ] Siguiente paso pendiente: esperar el procesamiento de Apple y probar la app desde TestFlight.

### 2026-09-20

- [x] Se preparó la configuración de publicación iOS con bundle identifier, versión `1.0.0`, build inicial y perfiles EAS.
- [x] Validado: `npx expo config --type public`, `npm run typecheck`, `npm run lint` y 56 pruebas Jest.
- [x] Se añadió `paw-reminder.png` como base visual del splash y se preparó el asset gráfico para la publicación inicial.
- [x] Validado: PNG cuadrado de 1254 × 1254 y configuración Expo resuelta correctamente.
- [ ] Siguiente paso pendiente: completar Apple Developer/App Store Connect para generar el build de TestFlight.

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
- [x] Se agregó la pausa y reactivación de recordatorios desde la edición de cada tratamiento.
- [x] Validado: TypeScript, ESLint y 53 pruebas unitarias ejecutadas correctamente.
- [x] Se agregaron vacunas y otros cuidados con nombre y frecuencia configurables, junto al catálogo antiparasitario existente.
- [x] Validado: TypeScript, ESLint y 56 pruebas unitarias ejecutadas correctamente.
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
| Alto | Dashboard de seguimiento preventivo por mascota | Pendiente |
| Alto | Calendario interactivo con detalle y filtros | Pendiente |
| Alto | Historial ampliado y resumen para veterinario | Pendiente |
| Alto | Experiencia inicial y estados vacíos orientados a acciones | Pendiente |
| Alto | Adaptación y validación de la experiencia en iPad | Pendiente |
| Alto | Nueva build para superar Guideline 4.2 | Pendiente |
| Medio | Publicación en tiendas | Pendiente |

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
| Tipos de cuidado ampliados | Vacunas y cuidados manuales configurables | TypeScript, ESLint y pruebas unitarias |

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
