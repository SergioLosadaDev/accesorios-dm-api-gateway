## [HU-DEV-SALB_XX] Título de la Historia de Usuario

---

### Descripción

<!-- Describe brevemente qué hace este PR y por qué es necesario. -->

---

### HU relacionada

- **ID:** HU-DEV-SALB_XX
- **Repositorio del backlog:** [accesorios-dm/docs/HUs/HU-DEV-SALB_XX.md](../accesorios-dm/docs/HUs/)

---

### ADRs aplicados

<!-- Marca los ADRs que guiaron la implementación de esta HU. -->

- [ ] ADR-002 — API Gateway con NestJS
- [ ] ADR-003 — JWT RS256
- [ ] ADR-006 — Comunicación síncrona REST
- [ ] ADR-008 — Versionamiento de APIs (`/api/v1/`)
- [ ] ADR-009 — Formato estándar de errores

---

### Tipo de cambio

- [ ] `feat` — Nueva funcionalidad
- [ ] `fix` — Corrección de bug
- [ ] `refactor` — Refactorización
- [ ] `chore` — Configuración / dependencias
- [ ] `docs` — Documentación
- [ ] `ci` — Pipeline CI/CD

---

### Criterios de aceptación completados

<!-- Copia los criterios de la HU y marca los que están completos. -->

- [ ] ...
- [ ] ...
- [ ] ...

---

### Checklist técnico

- [ ] El código no contiene secretos, credenciales ni valores hardcodeados.
- [ ] Las rutas siguen el prefijo `/api/v1/` (ADR-008).
- [ ] Los errores devueltos cumplen el formato estándar (ADR-009).
- [ ] El Gateway no contiene lógica de negocio (ADR-002).
- [ ] No hay acceso cross-schema en la base de datos (ADR-005).
- [ ] Las variables de entorno nuevas están documentadas en `.env.example`.

---

### Checklist de Definición de Done

- [ ] Los criterios de aceptación de la HU están cumplidos.
- [ ] El servicio levanta correctamente con `docker-compose`.
- [ ] El CI pasa (lint, build, tests si aplica).
- [ ] El reviewer aprobó el PR.
- [ ] La rama `HU-DEV-SALB_XX` será eliminada tras el merge.

---

### Notas al reviewer

<!-- Contexto adicional, decisiones tomadas, áreas de atención especial. -->
