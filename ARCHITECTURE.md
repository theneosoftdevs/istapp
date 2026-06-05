# Architecture Générale - ISTA PORTAL

## Vue d'ensemble

**ISTA PORTAL** est une plateforme de gestion universitaire complète développée avec React 19 et Vite. L'application suit une architecture modulaire basée sur les **rôles utilisateurs** (RBAC - Role-Based Access Control) et utilise une gestion d'état centralisée en mémoire.

### Caractéristiques principales
- ✅ **TypeScript 5.7** - Type-safety complète
- ✅ **React 19** - Framework UI moderne
- ✅ **Vite** - Build rapide et HMR performant
- ✅ **Tailwind CSS 4** - Stylisation utilitaire
- ✅ **Radix UI** - Composants accessibles et primitifs
- ✅ **React Router v6** - Routage avec guards
- ✅ **PWA-ready** - Support mode hors-ligne et installation
- ✅ **Multi-langue** - Localisations intégrées

---

## Architecture du Projet

```
src/
├── App.tsx                          # Configuration des routes et guards
├── main.tsx                         # Entry point avec providers
├── types.ts                         # Définitions TypeScript globales
├── index.css                        # Styles globaux + Tailwind
│
├── contexts/                        # Gestion d'état React Context
│   ├── AuthContext.tsx             # Authentification + Role management
│   └── AppContext.tsx              # Thème + Navigation + Sidebar
│
├── layouts/                         # Layouts réutilisables
│   ├── AppLayout.tsx               # Shell principal (header + sidebar + footer)
│   ├── AppSidebar.tsx              # Navigation desktop/tablet
│   └── MobileNavbar.tsx            # Navigation mobile
│
├── pages/                          # Pages par rôle utilisateur
│   ├── LoginPage.tsx               # Page d'authentification
│   ├── NotificationsPage.tsx       # Centre de communications
│   ├── SettingsPage.tsx            # Paramètres utilisateur
│   ├── student/                    # Portail Étudiant
│   ├── teacher/                    # Portail Enseignant
│   ├── apparitorat/                # Portail Apparitorat
│   ├── secretariat_faculte/        # Portail Secrétariat Faculté
│   ├── secretariat_general/        # Portail Secrétariat Général
│   └── rectorat/                   # Portail Rectorat
│
├── components/                     # Composants réutilisables
│   ├── ui/                         # Composants Radix UI wrappés
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── ... (20+ composants)
│   ├── ErrorBoundary.tsx           # Gestion des erreurs
│   └── ... (autres composants métier)
│
├── lib/                            # Utilitaires et helpers
│   ├── portals.ts                  # Configuration des rôles et navigation
│   ├── utils.ts                    # Fonctions utilitaires
│   ├── locales.json                # Traductions multilingues
│   └── ... (helpers divers)
│
├── hooks/                          # Hooks React personnalisés
│   ├── use-navigation.ts           # Détection du mode (mobile/tablet/desktop)
│   └── ... (autres hooks)
│
├── data.json                       # Données d'application (mock)
└── public/
    ├── ista.jpeg                   # Logo
    └── sw.js                       # Service Worker (PWA)
```

---

## Flux d'Authentification

### 1. **Page de Connexion** (`LoginPage.tsx`)

```
┌─────────────────────────────────────────────────┐
│         ISTA PORTAL - Sélection du Portail      │
├─────────────────────────────────────────────────┤
│  ┌─────────────┬──────────────┬───────────────┐ │
│  │  Étudiant   │ Enseignant   │ Apparitorat   │ │
│  └─────────────┴──────────────┴───────────────┘ │
│  ┌─────────────┬──────────────┬───────────────┐ │
│  │Sec. Faculté │ Sec. Général │   Rectorat    │ │
│  └─────────────┴──────────────┴───────────────┘ │
└─────────────────────────────────────────────────┘
            │
            ├─→ Sélection d'un rôle
            │
            ├─→ Formulaire Email/Mot de passe
            │
            └─→ login(role) → Stockage localStorage
```

**Comportement** :
- Affichage de 6 portails avec description
- Sélection d'un portail → formulaire modal
- Validation + appel `login()` du AuthContext
- Redirection vers `/` → `RoleRedirect` → `/[role]/dashboard`

### 2. **AuthContext** - Gestion de l'authentification

```typescript
interface AuthContextValue {
  user: User | null           // Données utilisateur actuelles
  role: Role | null           // Rôle sélectionné
  isAuthenticated: boolean    // État connecté
  login: (role: Role) => void // Fonction de connexion
  logout: () => void          // Fonction de déconnexion
}
```

**Persistence** :
- Stockage localStorage avec clé `ista-role`
- Récupération automatique au rechargement

### 3. **Guards et Redirection**

```typescript
// RequireAuth - Protège toutes les routes protégées
if (!isAuthenticated) → redirect /login

// RoleGuard - Vérifie le rôle correspondant
if (user.role !== allowedRole) → redirect /${user.role}/dashboard

// RoleRedirect - Route /login ou / redirige
→ /${role}/dashboard
```

---

## Gestion d'État

### **AppContext** - État global de l'application

Gère trois domaines :

| Domaine | Géré par | Persistance |
|---------|----------|-------------|
| **Thème** | `theme: "light" \| "dark"` | localStorage (`ista-theme`) |
| **Navigation** | `sidebarOpen: boolean` | Session memory |
| **Portail** | `portal: PortalInfo` | Dérivé du rôle |

```typescript
const AppContext = {
  theme: "light" | "dark",        // Mode clair/sombre
  toggleTheme: () => void,        // Bascule du thème
  sidebarOpen: boolean,           // Sidebar visible ?
  setSidebarOpen: (open) => void, // Contrôle sidebar
  toggleSidebar: () => void,      // Bascule sidebar
  nav: NavItem[],                 // Menu navigation du rôle
  portal: PortalInfo & {...}      // Infos portail actif
}
```

### **Data Flow**

```
┌──────────────────────────┐
│   Données (data.json)    │
└────────┬─────────────────┘
         │
         ├─→ Charges au démarrage
         │
         ├─→ Utilisée par les pages
         │
         ├─→ Pas de backend
         │
         └─→ Mock data pour démo
```

---

## Structure des Pages par Rôle

### **6 Portails Distincts**

#### 1️⃣ **Étudiant** (`/student`)
- Dashboard : Aperçu des cours et notes
- Schedule : Horaire personnel
- Grades : Consultation des notes
- Assignments : Travaux à rendre
- Resources : Ressources pédagogiques

#### 2️⃣ **Enseignant** (`/teacher`)
- Dashboard : Aperçu des cours
- Courses : Gestion des cours
- Grades : Saisie et validation des notes
- Assignments : Gestion des travaux
- Schedule : Horaire d'enseignement

#### 3️⃣ **Apparitorat** (`/apparitorat`)
- Dashboard : Statistiques inscriptions
- Inscriptions : Formulaire d'inscription étudiant
- Students : Gestion étudiants
- Rooms : Gestion des locaux

#### 4️⃣ **Secrétariat Faculté** (`/secretariat_faculte`)
- Dashboard : Statistiques académiques
- Promotions : Gestion des promotions
- Courses : Gestion des cours
- Recours : Gestion des recours étudiants

#### 5️⃣ **Secrétariat Général** (`/secretariat_general`)
- Dashboard : Supervision globale
- Entities : Gestion des entités
- Students : Vue globale étudiants
- Teachers : Vue globale enseignants
- Academic : Données académiques

#### 6️⃣ **Rectorat** (`/rectorat`)
- Dashboard : Tableau de bord exécutif
- Stats : Statistiques institutionnelles
- Faculties : Vue des facultés
- Academic : Données académiques

### **Routes Communes**
- `/communications` - Centre de notifications
- `/settings` - Paramètres utilisateur

---

## Système de Navigation

### **Configuration** (`lib/portals.ts`)

```typescript
// Configuration centralisée des rôles
const PORTALS = [
  {
    role: "student",
    label: "Étudiant",
    description: "Cours, notes et horaire.",
    icon: GraduationCap,
    color: "text-chart-1"
  },
  // ... (5 autres portails)
]

// Navigation par rôle
const NAV_BY_ROLE = {
  student: [
    { label: "Accueil", to: "/student/dashboard", icon: Home },
    { label: "Horaire", to: "/student/schedule", icon: CalendarDays },
    // ...
  ],
  // ... (5 autres rôles)
}
```

### **Modes d'Affichage**

Le hook `use-navigation.ts` détecte le viewport et active le mode approprié :

```
Mobile (< 768px)
├─→ TopBar seul (logo + menu)
└─→ Bottom Navigation (mobile-only)

Tablet (768px - 1024px)
├─→ Sidebar latérale compacte
└─→ Contenu principal

Desktop (> 1024px)
├─→ Sidebar latérale complète
└─→ Contenu principal
└─→ Pas de bottom navigation
```

---

## Composants UI

### **Fondations - Radix UI**

L'application utilise 20+ composants Radix UI enrobés avec Tailwind CSS :

| Composant | Radix | Description |
|-----------|-------|-------------|
| `Button` | `button` | Bouton avec variantes |
| `Card` | Div | Conteneur stylisé |
| `Dialog` | `dialog` | Modal |
| `Dropdown` | `dropdown-menu` | Menu déroulant |
| `Toast` | `toast` | Notifications |
| `Select` | `select` | Sélection |
| `Tabs` | `tabs` | Onglets |
| `Tooltip` | `tooltip` | Info-bulles |

### **Variables CSS Tailwind**

```css
/* Thème personnalisé */
:root {
  --primary: #3b82f6;           /* Bleu principal */
  --secondary: #8b5cf6;         /* Violet */
  --destructive: #ef4444;       /* Rouge */
  --background: #ffffff;        /* Fond */
  --foreground: #000000;        /* Texte */
  --muted: #f3f4f6;            /* Gris clair */
  --chart-1 à 5: Couleurs      /* Graphiques */
}

/* Mode sombre */
.dark {
  --background: #0f172a;
  --foreground: #f8fafc;
  /* ... */
}
```

---

## Gestion des Données

### **Source de données** (`data.json`)

```typescript
interface AppData {
  teacherTitles: string[]
  users: User[]                 // Utilisateurs pré-créés
  faculties: Faculty[]          // Facultés
  promotions: Promotion[]       // Promotions/Années
  students: Student[]           // Étudiants
  teachers: Teacher[]           // Enseignants
  courses: Course[]             // Cours
  schedules: ScheduleSlot[]     // Horaires
  grades: Grade[]               // Notes
  announcements: Announcement[] // Annonces
  assignments: Assignment[]     // Travaux
  submissions: Submission[]     // Soumissions
  gradeAppeals: GradeAppeal[]   // Recours
  courseResources: CourseResource[] // Ressources
  notifications: Notification[] // Notifications
  rooms: Room[]                 // Locaux
}
```

**Modèle d'accès** :
- Chargement statique au démarrage
- Pas d'appels API
- Parfait pour prototype/démo
- Migration future vers backend possible

---

## PWA & Mode Hors-ligne

### **Service Worker** (`public/sw.js`)

```typescript
// Enregistrement
navigator.serviceWorker.register('/sw.js')

// Caching stratégies
- Network first (assets dynamiques)
- Cache first (assets statiques)
- Stale-while-revalidate
```

### **Manifest** (implicite)

```json
{
  "name": "ISTA PORTAL",
  "short_name": "ISTA",
  "scope": "/",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/ista.jpeg", "sizes": "192x192" }
  ]
}
```

### **Fonctionnalités**

- ✅ Installation sur l'écran d'accueil
- ✅ Accès hors-ligne
- ✅ Synchronisation en background
- ✅ Notifications push (préparation)

---

## Types TypeScript

### **Domaines principaux**

```typescript
// Authentification
type Role = "student" | "teacher" | "apparitorat" 
          | "secretariat_faculte" | "secretariat_general" | "rectorat"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  // ... autres champs
}

// Académique
interface Student { /* id, matricule, grades... */ }
interface Teacher { /* id, courses... */ }
interface Course { /* id, credits, teacherId... */ }
interface Grade { /* id, score, status... */ }

// Notifications
interface Announcement { /* priority, audience, scope... */ }
interface GradeAppeal { /* reason, status, estimatedGrade... */ }
```

---

## Pipeline de Build

### **Vite Configuration**

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'  // Import absolus
    }
  },
  // Optimisations de perf
})
```

### **Commandes**

```bash
pnpm dev       # Développement avec HMR
pnpm build     # Production bundle
pnpm preview   # Test du bundle produit
```

### **Optimisations**

- Code splitting automatique
- Tree-shaking
- Minification CSS/JS
- Compression Gzip

---

## Sécurité & Bonnes Pratiques

### **Sécurité**

| Aspect | Mesure |
|--------|---------|
| **XSS** | React escaping + Content Security Policy |
| **Authentification** | Simulation (localStorage) - À remplacer par JWT |
| **RBAC** | Guards route + Validation contexte |
| **CSRF** | N/A (pas de backend) - À implémenter |

### **Performance**

- React.memo pour composants lourds
- useCallback pour stabiliser les références
- Lazy loading des pages
- Code splitting par route

### **Accessibilité**

- ♿ Radix UI (accessible par défaut)
- Attributs `aria-label` sur icônes
- Contraste WCAG AA minimum
- Navigation au clavier complète

---

## Extension Future

### **Intégration Backend**

```typescript
// Remplacer data.json par API calls
const fetchUsers = () => fetch('/api/users')
const createGrade = (grade: Grade) => fetch('/api/grades', ...)

// Authentication avec JWT
const token = localStorage.getItem('auth-token')
const headers = { 'Authorization': `Bearer ${token}` }
```

### **État Distribué**

```typescript
// Considérer Zustand ou Redux pour :
// - État partagé complexe
// - Time-travel debugging
// - Middleware personnalisé

import { create } from 'zustand'
const useStore = create((set) => ({...}))
```

### **Temps Réel**

```typescript
// WebSockets pour synchronisation
import { useSocket } from '@/hooks/use-socket'
const { on, emit } = useSocket()

// Ou SSE pour notifications
const sse = new EventSource('/api/sse')
```

---

## Résumé des Couches

```
┌─────────────────────────────────────────┐
│         Couche UI (React Components)    │
├─────────────────────────────────────────┤
│   Radix UI + Tailwind CSS               │
├─────────────────────────────────────────┤
│  Contexts (Auth, App)                   │
│  Hooks personnalisés                    │
├─────────────────────────────────────────┤
│  React Router v6 + Guards               │
├─────────────────────────────────────────┤
│  Data Layer (data.json → future API)    │
├─────────────────────────────────────────┤
│  Service Worker (PWA)                   │
│  LocalStorage (persistence)             │
└─────────────────────────────────────────┘
```

---

## Points de Démarrage

### **Pour développer**
1. Cloner le repo
2. `pnpm install`
3. `pnpm dev` → http://localhost:5173

### **Pour déployer**
1. `pnpm build`
2. Upload `/dist` sur serveur
3. Ou déployer sur Vercel/Netlify

### **Pour intégrer un backend**
1. Remplacer `data.json` par appels API
2. Ajouter authentification JWT
3. Implémenter mutations (création/mise à jour)

---

## Références

- [React 19 Docs](https://react.dev)
- [Vite](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [React Router](https://reactrouter.com)
