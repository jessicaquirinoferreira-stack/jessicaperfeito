# Security Specification — Jéssica Perfeito | Imóveis

## 1. Data Invariants
1. Default-deny catch-all at `/databases/{database}/documents/{document=**}`.
2. Public visitors can ONLY read `properties` with `published == true`, `empreendimentos` with `published == true`, and `landingPages` with `status == 'publicada'`. Drafts and paused items are restricted to `isAdmin()`.
3. Public visitors can NEVER read (`get` or `list`), update, or delete PII collections (`leads`, `visitRequests`, `adminUsers`) or `analytics`.
4. Public visitors can ONLY `create` documents in `leads`, `visitRequests`, and `analytics` with strict field allowlists (`hasAll` + `hasOnly`), size limits, `lgpdConsent == true` (for leads/visits), initial status forced (`'Novo'` for leads, `'Pendente'` for visits), and `createdAt == request.time`.
5. No self-assigned admin escalation: non-admins cannot create or update `adminUsers` with `role: 'admin'`, except authenticated admin credentials verified at the rule level.
6. All path IDs validated with `isValidId()` (`^[a-zA-Z0-9_\-]+$`, max 128 chars).

## 2. Dirty Dozen Payloads (Expected PERMISSION_DENIED)
1. Unauthenticated read on `/leads/lead1` -> DENIED (PII isolation).
2. Unauthenticated list on `/visitRequests` -> DENIED (PII isolation).
3. Unauthenticated list on `/properties` without `published == true` -> DENIED (draft leak).
4. Unauthenticated read on `/landingPages/draft_lp` where `status == 'rascunho'` -> DENIED.
5. Public lead creation with `status: 'Visitado'` instead of `'Novo'` -> DENIED (state shortcutting).
6. Public lead creation with ghost field `isAdmin: true` -> DENIED (`hasOnly` shadow field guard).
7. Public lead creation with `lgpdConsent: false` -> DENIED (LGPD enforcement).
8. Public lead creation with 2MB message string -> DENIED (size boundary).
9. Public lead creation with forged `createdAt` timestamp != `request.time` -> DENIED (temporal integrity).
10. Public visit creation with ID `../../etc/passwd` -> DENIED (`isValidId` path guard).
11. Unauthenticated write to `/siteSettings/main` -> DENIED (admin-only configuration).
12. Unauthenticated write to `/adminUsers/attacker` -> DENIED (privilege escalation guard).
