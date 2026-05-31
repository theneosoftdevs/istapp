---
name: Refactoring architecture ISTA-Goma
description: Décisions d'architecture prises lors du grand refactoring (hooks partagés, constantes, guards, seed data).
---

## Règle : Seed data → data.json uniquement

Toutes les données initiales (assignments, submissions, courseResources, gradeAppeals, notifications, teacherTitles) vivent dans `src/data.json`. Le store les charge via `structuredClone(rawData) as AppData` avec defaults défensifs dans `initState()`.

**Why:** évite la double source de vérité entre le JSON et le store.

**How to apply:** jamais de tableau hardcodé dans `store.ts`. Si nouvelles entités ajoutées → les mettre dans `data.json` et ajouter un champ dans `AppData`.

---

## Règle : Constantes UI → src/lib/constants.ts

`WEEK_DAYS`, `WEEK_DAYS_FULL`, `RESOURCE_ICONS`, `RESOURCE_LABELS`, `RESOURCE_COLORS` sont définis une seule fois dans `src/lib/constants.ts`.

**Why:** 5+ composants utilisaient les mêmes tableaux/objets copiés-collés.

---

## Règle : Résolution user courant → useCurrentStudent / useCurrentTeacher

Hooks dans `src/hooks/useCurrentUser.ts` prennent `store: AppData` en paramètre et retournent l'entité liée à `user.refId`. Fallback sur le premier élément du store (mode démo).

**Why:** pattern `user?.refId ?? "s1"` était dupliqué dans 10+ fichiers.

**How to apply:** pages avec `useStore()` → `const student = useCurrentStudent(store)`. Pages avec `usePageData()` → résolution inline dans le sélecteur via `user?.refId` (pas de fallback hardcodé `"s1"`).

---

## Règle : Sécurité des routes → RoleGuard dans App.tsx

Composant `RoleGuard({ allow: Role })` qui rend `<Outlet />` ou redirige. Enveloppé autour de chaque groupe de routes par rôle à l'intérieur du layout `AppLayout`.

**Why:** sans garde, tout utilisateur authentifié pouvait accéder à n'importe quel portail en tapant l'URL manuellement.

**How to apply:** toujours ajouter un `<Route element={<RoleGuard allow="..." />}>` autour des nouvelles routes de rôle.

---

## Règle : Validation des scores → clampScore dans store.ts

Fonction `clampScore(n)` applique `Math.max(0, Math.min(20, n))` avant d'enregistrer. Utilisée dans `setGradeScore` et `gradeSubmission`.

**Why:** saisies UI non validées pouvaient créer des notes hors plage.
