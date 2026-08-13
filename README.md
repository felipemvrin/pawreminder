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
