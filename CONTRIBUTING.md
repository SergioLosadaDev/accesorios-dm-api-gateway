# Guía de Contribución — API Gateway

> Servicio: `accesorios-dm-api-gateway` | Stack: NestJS + TypeScript | Puerto: `3000`

---

## 1. Requisitos previos

- Node.js 20 LTS
- Docker y Docker Compose
- Git configurado con tu nombre y email
- Acceso al repositorio en GitHub

---

## 2. Setup local

```bash
# Clonar el repositorio
git clone https://github.com/SergioLosadaDev/accesorios-dm-api-gateway.git
cd accesorios-dm-api-gateway

# Copiar variables de entorno
cp .env.example .env
# Editar .env con los valores correctos para desarrollo local

# Levantar con Docker Compose (desde el directorio raíz del workspace)
docker-compose up api-gateway

# O en modo desarrollo local (sin Docker)
npm install
npm run start:dev
```

---

## 3. Estrategia de ramas

El proyecto tiene tres ramas permanentes que representan los tres ambientes:

| Rama | Ambiente | Descripción |
|---|---|---|
| `main` | Producción | Solo recibe merges desde `qa` con aprobación manual |
| `qa` | QA / Testing | Solo recibe merges desde `develop` al cerrar un ciclo |
| `develop` | Desarrollo | Integración continua. Base para todas las HUs |

**Ninguna de estas ramas acepta push directo.** Todo cambio entra por Pull Request.

---

## 4. Convención de ramas de feature

```
HU-DEV-SALB_XX
```

Donde `XX` es el número de la Historia de Usuario (con cero a la izquierda).

```bash
# Crear rama desde develop actualizado
git checkout develop
git pull origin develop
git checkout -b HU-DEV-SALB_05
```

---

## 5. Convención de commits

Se usa [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<scope>): <descripción en imperativo, minúsculas>
```

**Tipos:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`

**Scope:** ID de la HU o módulo afectado.

```bash
# Ejemplos correctos
git commit -m "feat(HU-DEV-SALB_05): add JWT RS256 auth guard"
git commit -m "fix(HU-DEV-SALB_03): normalize 502 error from downstream service"
git commit -m "test(HU-DEV-SALB_05): add unit tests for auth guard"
git commit -m "chore(deps): update @nestjs/passport to 10.0.3"

# Ejemplos incorrectos
git commit -m "cambios"
git commit -m "fix stuff"
git commit -m "WIP"
git commit -m "Update code"
```

---

## 6. Proceso de Pull Request

1. Crear la rama desde `develop` con el nombre `HU-DEV-SALB_XX`.
2. Desarrollar con commits atómicos.
3. Hacer push y abrir PR en GitHub usando la plantilla disponible.
4. El título del PR debe ser: `[HU-DEV-SALB_XX] Título de la HU`.
5. Asignar al menos 1 reviewer.
6. El CI debe pasar antes de la aprobación.
7. Tras la aprobación, el **autor** hace el merge (Squash and Merge hacia `develop`).
8. El autor elimina la rama remota tras el merge:
   ```bash
   git push origin --delete HU-DEV-SALB_XX
   git branch -d HU-DEV-SALB_XX
   ```

---

## 7. Estándares técnicos del servicio

Estos estándares son de cumplimiento obligatorio en todo el código del Gateway:

| Estándar | Referencia |
|---|---|
| Prefijo de rutas `/api/v1/` | ADR-008 |
| Errores en formato estándar del sistema | ADR-009 |
| El Gateway no implementa lógica de negocio | ADR-002 |
| Validación JWT con clave pública RS256 (sin llamar a Security Service) | ADR-003 |
| Sin secretos en el código — siempre variables de entorno | Seguridad |
| Los servicios internos reciben headers `X-User-*` y `X-Trace-Id` | ADR-003 |

---

## 8. Definición de Done

Un PR puede mergearse a `develop` cuando:

- [ ] Los criterios de aceptación de la HU están cumplidos.
- [ ] El servicio levanta con `docker-compose up api-gateway`.
- [ ] El CI pasa sin errores.
- [ ] Al menos 1 reviewer aprobó el PR.
- [ ] No hay secretos ni credenciales en el código.
- [ ] Los estándares técnicos de la sección anterior se cumplen.

---

## 9. Estructura del proyecto

```
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── filters/          ← ExceptionFilter global (ADR-009)
│   ├── guards/           ← JwtAuthGuard (ADR-003)
│   └── interceptors/     ← Logging + TraceId
├── proxy/                ← Módulos de proxy por servicio
└── health/               ← Health checks
```

---

## 10. Variables de entorno

Ver `.env.example` para la lista completa. Las variables críticas son:

```
PORT                    Puerto del servidor (default: 3000)
SECURITY_SERVICE_URL    URL interna del Security Service
INVENTORY_SERVICE_URL   URL interna del Inventory Service
JWT_PUBLIC_KEY          Clave pública RSA para validar tokens
ALLOWED_ORIGINS         Orígenes CORS permitidos (CSV)
```

> ⚠️ **Nunca commitear el archivo `.env`**. Está en `.gitignore`.

---

## 11. Recursos

- [Backlog de HUs](../accesorios-dm/docs/HUs/)
- [ADRs del proyecto](../accesorios-dm/docs/ADRs-v2/)
- [Git Strategy completo](../accesorios-dm/docs/git-strategy/GIT-STRATEGY.md)
- [NestJS Documentation](https://docs.nestjs.com)
