# ⚡️ TicketSys | Sistema Integral de Gestión de Tareas

**TicketSys** es una moderna plataforma de gestión de tareas y tickets de soporte técnico construida bajo un enfoque de alta eficiencia, escalabilidad y la mejor experiencia de usuario (UX/UI). 

Este documento sirve como el **Manual Maestro** del sistema completo, documentando tanto la aplicación cliente (Frontend) como la infraestructura del servidor (Backend) y sus despliegues en la nube.

---

## 🚀 Tabla de Contenidos

- [Descripción General de la Solución](#-descripción-general-de-la-solución)
- [Stack Tecnológico y Nube](#-stack-tecnológico-y-nube)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Guía de Usuario Final](#-guía-de-usuario-final)
    - [Roles y Permisos](#roles-y-permisos)
    - [Ciclo de Vida de un Ticket](#ciclo-de-vida-de-un-ticket)
- [Guía de Instalación Local (Desarrolladores)](#-guía-de-instalación-local-desarrolladores)
    - [Desplegar el Frontend](#1-desplegar-el-frontend)
    - [Desplegar el Backend](#2-desplegar-el-backend-api)

---

## 💡 Descripción General de la Solución

TicketSys resuelve el problema de la gestión y distribución del trabajo técnico dentro de una organización. El sistema está dividido en dos grandes bloques desacoplados:

1. **El Frontend (React)**: Una interfaz Web ultrarrápida, diseñada bajo la filosofía *Mobile-First*. Permite a los usuarios visualizar tareas en tiempo real, filtrar estados mediante consultas nativas al servidor y disfrutar de una interfaz adaptable (Temas Automáticos y soporte Multi-idioma).
2. **El Backend (NestJS)**: El cerebro del sistema. Una API RESTful segura, gobernada por validaciones en el ciclo de vida del dato (DDD). Controla quién cuenta con los permisos necesarios para modificar una tarea, manejar la asignación de usuarios y proteger el ecosistema mediante autenticación por Json Web Tokens (JWT).

Ambos sistemas se diseñaron para convivir en una **Arquitectura Serverless y PaaS (Platform as a Service)**, eliminando la necesidad de manejar servidores virtuales o contenedores Docker manuálmente.

---

## ☁️ Stack Tecnológico y Nube

### Infraestructura Cloud (Producción)
La plataforma vive en el ecosistema de la nube moderna para asegurar alta disponibilidad y despliegues sin fricción (CI/CD Automático).
- **Frontend Hosting:** [Vercel](https://vercel.com) (Despliegue automático de la SPA).
- **Backend API Hosting:** [Koyeb](https://koyeb.com) (Motor Serverless de alto rendimiento para Node.js).
- **Base de Datos:** [Railway](https://railway.app) (MySQL gestionado en la nube).
- **Pipelines CI/CD:** Hooks nativos de Vercel y Koyeb directamente conectados al repositorio de GitHub para auto-despliegues ante cada *Push* en la rama `main`.

### Frontend (Este Repositorio)
- **Core**: React 18, TypeScript, Vite.
- **Enrutamiento y Estado**: React Router v6, Zustand (State Management).
- **Estilos y UI**: Tailwind CSS v3, Iconos nativos `lucide-react`.
- **Conectividad:** Axios con Interceptores JWT.
- **Localización**: `i18next` (Multilenguaje Automático ES/EN).

### Backend (API RESTful)
- **Framework:** NestJS (Node.js) con TypeScript.
- **Persistencia:** TypeORM conectado a la base MySQL de Railway.
- **Seguridad:** JWT (JSON Web Tokens), Passport, bcrypt (Hasheo de contraseñas).
- **Documentación Viva:** Swagger / OpenAPI nativo.

---

## 🏗 Arquitectura del Proyecto

Tanto el Backend como el Frontend comparten una estructura de **Arquitectura Limpia / Domain-Driven Design (DDD)**. 

En el **Frontend**, el código se divide en tres capas de responsabilidad exclusivas cerradas:
1. **`domain/` (Dominio)**: Contratos, tipados estáticos puros e interfaces (`Ticket.ts`, `TicketRepository.ts`). No importa nada de React o librerías de red.
2. **`infrastructure/` (Infraestructura)**: Capa de conectividad HTTP, clientes Axios refactorizados para apuntar automáticamente la API alojada en Koyeb y lógica de hidratación.
3. **`presentation/` (Presentación)**: La magia visual. Componentes reactivos, Store global de Zustand, Router visual y diseño en Tailwind CSS.

---

## 📖 Guía de Usuario Final

Desde la perspectiva de los miembros de la empresa, el flujo de uso está profundamente custodiado por los roles y el ciclo de vida de cada orden de trabajo.

### Roles y Permisos

- **👑 Administrador (`admin`)**
  - Es el arquitecto del sistema. 
  - Capaz de **crear e invitar a nuevos empleados** al sistema mediante el panel de usuarios.
  - Tiene el poder especial de **Editar** (cambiar títulos, reasignar responsables o alterar prioridad) de forma retrospectiva cualquier ticket, siempre y cuando este siga en estado **Pendiente**.
  - Si un ticket es un error u obsoleto, el adminstrador es la única figura capaz de aplicarle **Soft-Delete** permanentemente.

- **👥 Usuario Regular (`user`)**
  - Un rol de operario diario.
  - Aterrizan en su Dashboard en donde listan las órdenes o crean requerimientos de trabajo mediante el botón superior.
  - Pueden buscar activamente en la piscina de tareas no asignadas y **Reclamar (Claim)** la autoría operativa de una.

### Ciclo de Vida de un Ticket

El sistema obliga un esquema seguro de trabajo:

1. **Pendiente (`pending`)**: El ticket existe, todos lo ven, pero nadie se hace responsable. (Admins pueden modificar su información).
2. **En Progreso (`in_progress`)**: Alguien da click en "Reclamar". A partir de este momento **nadie en la empresa** puede editar la información del ticket, ni siquiera un admin, protegiendo al operador de cambios de lógica mientras trabaja.
3. **Completado (`completed`)**: El operador que reclamó el trabajo marca que ha concluido. El ticket se vuelve un registro inmutable en el historial. 
4. **Cancelado (`cancelled`)**: Solo el operador que **creó** originálmente el ticket (o quien lo tiene asignado) pueden decidir cancelar la orden. Nadie más tiene ese privilegio.

---

## 🛠 Guía de Instalación Local (Desarrolladores)

### 1. Desplegar el Frontend

**1. Clonar el repositorio y entrar al directorio:**
```bash
git clone https://github.com/ticket-sys/tickets-front.git
cd tickets-front
```

**2. Instalar dependencias puras:**
```bash
npm install
```

**3. Enlazar Base API Server (.env):**
Por defecto, el frente está listo para Vercel pero en tu máquina de desarrollo quizás no tengas a mano la API de Koyeb. Crea el archivo local.
```bash
cp .env.example .env
```
_(Edita `.env` para asegurar que `VITE_API_BASE_URL=http://localhost:3000` si correrás el backend de Nest en tu máquina)._

**4. Levantar entorno dev Vite Local:**
```bash
npm run dev
```

### 2. Desplegar el Backend (API)

**1. Clonar (En la respectiva carpeta del backend de NestJS):**
```bash
npm install
```

**2. Apuntar SQL Local:**
Preparar el entorno del `.env` del backend que Nest requiere:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=secret
DB_NAME=ticketsdb
JWT_SECRET=tu_secreto_local
PORT=3000
```
> **Nota de DB Local**: Instala nativamente MySQL Server en tu equipo de desarrollo o usa un motor amigable como XAMPP/MAMP. Docker no es utilizado en esta capa.

**3. Ejecutar Nest.js en formato Watch:**
```bash
npm run start:dev
```
_(TypeORM reconstruirá las tablas mágicamente al percibir que no existen, y el seeder inicial te generará automáticamente las credenciales estáticas de administrador)._ 

---
*TicketSys - 2026. Made with ❤️ and TypeScript.*
