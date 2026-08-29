---
name: readme-progress
description: "Use when the project advances, a feature is completed, or the status of the app changes. Updates the README with completed tasks, validation notes, and the next pending step."
---

# README progress workflow

Use this skill whenever the project advances or the delivery status needs to be updated.

## Objective

Keep [README.md](../../../README.md) aligned with the real state of the project without requiring a manual re-check every time.

## Workflow

1. Review the changes made in the codebase.
2. Identify the relevant task or milestone that was completed.
3. Update the status checklist in [README.md](../../../README.md).
4. Add a short validation note, such as:
   - pruebas ejecutadas
   - revisión funcional
   - validación manual en dispositivo
   - verificación del flujo principal
5. Add the next pending step in the same section.
6. Refresh the “Estado actual del proceso” section with the current state.
7. Keep language concise, factual, and repo-specific.

## Required output pattern

- [x] Tarea completada
- [x] Validado: breve nota de verificación
- [ ] Siguiente paso pendiente: descripción concreta

## Example

- [x] Se agrega el flujo de creación de tratamientos
- [x] Validado: revisión del flujo y pruebas del hook
- [ ] Siguiente paso pendiente: revisar permisos de notificación en Android

## Guardrails

- Do not describe future work as if it were already done.
- Do not leave stale statuses in the README.
- Prefer evidence from the code or tests over assumptions.
- Keep the update short and clear so the project status is easy to scan.
