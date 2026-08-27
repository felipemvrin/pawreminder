# PawReminder

Aplicación móvil para organizar los recordatorios de salud y cuidados de perros.

## Objetivo

PawReminder está en etapa de preparación técnica. Esta base establece la arquitectura, el sistema
de diseño y las integraciones desacopladas para desarrollar la aplicación de forma escalable. No
incluye todavía funcionalidades de negocio ni pantallas finales.

## Stack

- React Native con Expo SDK 54 y TypeScript estricto
- Expo Router
- Tamagui como sistema de componentes y tokens
- TanStack Query, React Hook Form y Zod
- React Native Reanimated y Lucide React Native
- Expo Notifications preparado para futuras notificaciones locales
- AsyncStorage detrás de una interfaz intercambiable por MMKV
- Jest, React Native Testing Library, ESLint y Prettier

## Requisitos

- Node.js 20.19.4 o superior (el proyecto incluye `.nvmrc`)
- npm 10 o superior
- Expo Go en un dispositivo físico, o Android Studio para emulador Android

## Instalación

```bash
nvm use
npm install
cp .env.example .env
```

Las variables de `.env` no deben contener secretos. Las credenciales privadas se configurarán
fuera del repositorio cuando se integren los proveedores correspondientes.

## Ejecución local

```bash
npm start
npm run android
npm run web
```

En macOS 12 no se pueden crear builds iOS locales para el SDK actual por la limitación de Xcode.
Usa Expo Go en un dispositivo iOS o EAS Build para builds en la nube.

## Estructura

```text
app/                 Rutas y layouts de Expo Router
src/components/      Componentes reutilizables y proveedores
src/features/        Módulos orientados a funcionalidades futuras
src/hooks/           Hooks reutilizables
src/lib/             Clientes y configuración de librerías
src/services/        Contratos e implementaciones de integraciones
src/store/           Estado global futuro
src/theme/           Tokens del sistema de diseño
src/types/           Modelos y tipos de dominio
src/utils/           Utilidades puras
src/test/            Configuración compartida de pruebas
```

`services/calendar` y `services/notifications` contienen solo contratos. La integración con
Google Calendar y la programación de recordatorios se implementarán en etapas posteriores.

## Comandos

| Comando             | Descripción                                |
| ------------------- | ------------------------------------------ |
| `npm start`         | Inicia Expo Metro                          |
| `npm run android`   | Abre el proyecto en Android                |
| `npm run ios`       | Solicita ejecución iOS mediante Expo       |
| `npm run web`       | Inicia la versión web                      |
| `npm run typecheck` | Valida TypeScript estricto                 |
| `npm run lint`      | Ejecuta ESLint                             |
| `npm run format`    | Comprueba formato con Prettier             |
| `npm test`          | Ejecuta pruebas unitarias y de componentes |

## Estado del proyecto

PawReminder se encuentra en la **Fase 3: validación y estabilización del MVP**.

### Fases

- [x] **Fase 0: Preparación técnica**
  - Configuración de Expo, TypeScript, Expo Router y Tamagui.
  - Definición de tipos, tokens y arquitectura.
  - Configuración de ESLint, Prettier y Jest.

- [x] **Fase 1: Persistencia e infraestructura**
  - Base de datos local SQLite.
  - Servicios desacoplados para almacenamiento y notificaciones.
  - Configuración de TanStack Query y formularios con React Hook Form y Zod.

- [x] **Fase 2: MVP funcional local**
  - Crear, editar y eliminar mascotas.
  - Configurar tratamientos internos y externos.
  - Calcular próximas fechas de aplicación.
  - Mostrar estados próximo, hoy y vencido.
  - Registrar aplicaciones e historial.
  - Programar notificaciones locales.
  - Marcar tratamientos como aplicados desde una notificación.
  - Consultar el estado de los tratamientos desde la pantalla principal.

- [ ] **Fase 3: Validación y estabilización**
  - Probar los flujos completos en dispositivos físicos Android e iOS.
  - Añadir pruebas para base de datos, tratamientos y notificaciones.
  - Mejorar estados de carga, error y ausencia de datos.
  - Revisar permisos y comportamiento de notificaciones.
  - Mejorar la selección y validación de fechas.
  - Corregir incidencias encontradas durante el uso real.

- [ ] **Fase 4: Mejoras de producto**
  - Calendario de tratamientos.
  - Fotografías de mascotas.
  - Repetición y edición avanzada de tratamientos.
  - Configuración de horarios y preferencias de notificación.
  - Soporte ampliado para cuidados y vacunas.

- [ ] **Fase 5: Sincronización y publicación**
  - Sincronización opcional en la nube.
  - Cuenta de usuario y recuperación de datos.
  - Copias de seguridad y migraciones.
  - Analítica y monitoreo de errores.
  - Builds de producción y publicación en App Store y Google Play.

## Estado actual

La configuración inicial está preparada con Expo Router, design tokens, tipos de dominio,
contratos de servicios, almacenamiento local intercambiable y herramientas de calidad. Las
pantallas, la persistencia de dominio, Calendar, autenticación y notificaciones siguen pendientes.

## Convenciones Git

Los commits siguen Conventional Commits y se escriben siempre en español, por ejemplo:

```text
feat: configura entorno inicial de React Native
chore: agrega configuración de ESLint
```
