# TransitOps Frontend Refactoring Rules

These rules are non-negotiable and must be followed at all times.

## 1. Scope & Backend Safety
- **Frontend Only:** Modify ONLY frontend files (within the `client/` directory).
- **Backend Protection:** NEVER modify backend code, controllers, models, database logic, authentication schemas, routing logic, or request/response structures in the `server/` directory.
- **API Preservation:** NEVER change or rename backend API endpoints.

## 2. Styling Rules (Tailwind CSS ONLY)
- **Tailwind Only:** Use ONLY Tailwind CSS utility classes.
- **Forbidden Technologies:** Never use separate CSS files, SCSS, Styled Components, Emotion, CSS Modules, or Inline CSS.
- **Single Source of Truth:** `client/src/index.css` is the ONLY global stylesheet allowed.
- **CSS Variables:** Define all theme colors using CSS variables inside `client/src/index.css` (specifically within the Tailwind `@theme` block).
- **Semantic Mapping:** Map component colors to semantic design tokens (e.g., `--color-primary-orange`, `--color-bg-deep-teal`, `--color-bg-card-glass`, etc.).
- **No Hardcoded Tailwind Colors:** Never use utilities like `bg-blue-500` or `text-red-600`. Instead, define semantic theme tokens in `index.css` and use them as custom utilities (e.g. `bg-primary-orange`, `text-text-muted`).
- **Unified Palette:** Ensure the entire application uses a single cohesive design system and color palette. No duplicate color definitions or shades.

## 3. UI Consistency & Reusable Components
- **Unified Theme:** Spacing, typography, shadows, borders, buttons, cards, forms, modals, tables, and tables must be consistent.
- **Component Dryness:** Extract repeated JSX into reusable UI components inside `src/components/common/`. Examples include:
  - `Button`, `Input`, `Select`, `Textarea`, `Checkbox`, `Switch`
  - `Modal`, `Dialog`, `Sidebar`, `Navbar`, `Footer`
  - `Card`, `Table`, `DataTable`, `SearchBar`, `Pagination`
  - `Loader`, `Spinner`, `Skeleton`, `Badge`, `Avatar`, `EmptyState`, `ErrorState`, `StatusPill`, `ConfirmDialog`
- **Reusable Layouts:** Implement page layouts under `src/components/layout/` (e.g., `MainLayout`, `DashboardLayout`, `AuthLayout`, `SettingsLayout`) and reuse them across routes.
- **Responsive Design:** Make all pages fully responsive across mobile, tablet, laptop, and desktop. Ensure no horizontal scrolling occurs.

## 4. State Management & Logic
- **Redux Toolkit:** Use Redux Toolkit (`configureStore`, `createSlice`, selectors) for state management. Avoid prop drilling.
- **Custom Hooks:** Place reusable component logic and hooks under `src/hooks/` (e.g., `useAuth`, `useModal`, `usePagination`, `useSearch`, `useDebounce`, `useTheme`, `useWindowSize`).
- **Icons:** Use only ONE icon library consistently (`lucide-react`). Do not mix icons from different packages.
- **Animations:** Keep animations subtle, using Tailwind transition utilities.

## 5. Quality, Accessibility & Performance
- **Accessibility:** Use semantic HTML5 markup, standard focus states, keyboard navigation, and `aria-label` attributes.
- **Forms:** Standardize form controls, required indicators, labels, and error messages.
- **Tables:** Standardize data tables to support loading, sorting, pagination, and empty states.
- **Loading States:** Provide elegant loading screens/skeletons for all asynchronous operations.
