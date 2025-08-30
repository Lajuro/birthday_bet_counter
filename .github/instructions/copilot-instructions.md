# GitHub Copilot Instructions

## Project Overview
This is a Brazilian baby birth prediction app built with Next.js 15, Firebase, and TypeScript. Users place bets on when baby Chloe will be born, with the app featuring a dynamic celebration mode that activates after birth.

## Core Architecture

### State Management Pattern
- **Auth State**: Managed via `AuthContext` (`src/contexts/auth-context.tsx`) with Firebase Auth integration
- **App Data**: Use `useBabyData` hook (`src/hooks/useBabyData.ts`) for fetching guesses, settings, and countdown data
- **No Redux**: Project uses React Context + custom hooks exclusively

### Firebase Integration
- **Firestore Collections**: `guesses`, `users`, `app_settings` 
- **Auth Flow**: Email/password + Google OAuth with admin approval system
- **Key Functions**: Import from `src/lib/firebase/firestore.ts` - always use `serverTimestamp()` for dates

### Theme System (Critical Pattern)
The app has **two visual modes** that dynamically switch based on `babyBorn` state:

```tsx
const babyBorn = appSettings?.actualBirthDate && appSettings.actualBirthDate.seconds;

// Normal mode: Indigo/slate colors, dark gradient backgrounds
// Celebration mode: Pink/purple/indigo pastels, light gradient backgrounds
className={`${babyBorn ? 'text-pink-700 dark:text-pink-300' : 'text-slate-700 dark:text-slate-300'}`}
```

**Always implement both themes** when creating new components - this is not optional.

### Responsive Design Rules
- **Mobile-first**: Start with mobile styles, add `sm:` `md:` `lg:` prefixes
- **Typography Scale**: `text-sm sm:text-base md:text-lg lg:text-xl`
- **Spacing Scale**: `p-2 sm:p-4 md:p-6 lg:p-8`
- **Grid Pattern**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- **Container**: `max-w-7xl mx-auto px-3 sm:px-4 lg:px-8`

## Development Workflows

### Key Commands
```bash
npm run dev          # Start with Turbopack (fast refresh)
npx tsc --noEmit     # Type checking only
npm run build        # Production build check
npx shadcn@latest add <component>  # Add new UI components
```

### File Structure Conventions
- **Components**: Domain-grouped in `src/components/bets/`, `src/components/ui/`
- **Hooks**: Custom hooks in `src/hooks/` (always start with `use`)
- **Types**: Centralized in `src/types/index.ts` with Firebase Timestamp types
- **Utils**: Firebase operations in `src/lib/firebase/`, general utils in `src/lib/`

### Component Patterns

#### Standard Page Layout
```tsx
<main className={`min-h-screen ${babyBorn ? 'bg-gradient-to-br from-pink-50/50 via-purple-50/30 to-indigo-50/50' : 'bg-gradient-to-b from-slate-950 to-slate-900'} flex flex-col`}>
  <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
    {/* Content */}
  </div>
</main>
```

#### Auth-Protected Routes
Always wrap admin pages with:
```tsx
const { user, isAdmin } = useAuth();
if (!user || !isAdmin) return <Navigate to="/admin/login" />;
```

#### Form Handling
Use React Hook Form + Zod validation. Firebase operations return promises - always handle loading states:
```tsx
const [isSubmitting, setIsSubmitting] = useState(false);
// Show loading spinners during Firebase operations
```

## Critical Integration Points

### Firebase Timestamp Handling
- **Never use Date objects** - Firebase uses `Timestamp` type
- **Server timestamps**: Use `serverTimestamp()` for creation/update dates
- **Date calculations**: Convert to JS Date only for display logic

### Error Boundary Pattern
The app uses toast notifications (`sonner`) for user feedback. Firebase errors should be caught and displayed as user-friendly messages in Portuguese.

### Mobile Menu System
The navbar uses an overlay-based mobile menu (not inline). Key classes:
- `mobile-menu-backdrop` - Fixed overlay with backdrop-blur
- `mobile-menu-content` - Slide-in content panel
- Body scroll prevention with `mobile-menu-open` class

### Admin Approval Flow
New users register but need admin approval before gaining full access. Check `userProfile.isApproved` and `userProfile.status` fields.

## Project-Specific Conventions

### Language
- **All UI text in Portuguese (PT-BR)**
- **Code comments and variables in English**
- **Error messages and user feedback in Portuguese**

### Design System
- **Primary Colors**: Indigo 600-700 (normal), Pink 600-700 (celebration)
- **Font**: Geist Sans + Geist Mono (already configured)
- **Components**: shadcn/ui with Tailwind CSS
- **Icons**: Lucide React (consistent 16px/20px/24px sizes)

### Data Flow
1. `useBabyData` hook fetches all app state on mount
2. Real-time countdown calculated in `useTimeCalculations` 
3. Closest guess determined by date proximity algorithm
4. Admin settings control guess submission and countdown display

## Key Files to Reference
- `src/types/index.ts` - Core data structures
- `src/hooks/useBabyData.ts` - Main data fetching pattern
- `src/components/navbar.tsx` - Complete responsive navigation example
- `ARCHITECTURE.md` - Detailed feature specifications
- `.copilot-instructions.md` - Comprehensive style guide and patterns
