# Style Guide Examples - Birthday Bet Counter

## Quick Reference for Common Patterns

### 1. Page Layout Pattern

```tsx
// Standard page structure
<main className={`min-h-screen ${
  babyBorn 
    ? 'bg-gradient-to-br from-pink-50/50 via-purple-50/30 to-indigo-50/50 dark:from-pink-950/20 dark:via-purple-950/10 dark:to-indigo-950/20' 
    : 'bg-gradient-to-b from-slate-950 to-slate-900'
} flex flex-col font-sans ${babyBorn ? 'p-2 sm:p-4' : ''}`}>
  
  {/* Page content */}
  <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
    {/* Your content here */}
  </div>
</main>
```

### 2. Card Component Pattern

```tsx
// Standard card with responsive design
<Card className={`w-full bg-gradient-to-br ${
  babyBorn 
    ? 'from-pink-50 via-purple-50 to-indigo-50 dark:from-pink-950/30 dark:via-purple-950/30 dark:to-indigo-950/30 border-pink-200/50 dark:border-pink-800/30' 
    : 'from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700'
} shadow-xl overflow-hidden`}>
  
  <CardHeader className="relative text-center py-4 sm:py-6 px-3 sm:px-4 lg:px-6">
    <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${
      babyBorn ? 'text-pink-700 dark:text-pink-300' : 'text-slate-700 dark:text-slate-300'
    }`}>
      Card Title
    </h2>
  </CardHeader>
  
  <CardContent className="relative pb-4 sm:pb-6 px-3 sm:px-4 lg:px-6">
    {/* Card content */}
  </CardContent>
</Card>
```

### 3. Counter/Stats Grid Pattern

```tsx
// Responsive grid for counters or statistics
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
  {items.map((item, index) => (
    <div 
      key={index}
      className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg border ${
        babyBorn 
          ? 'border-pink-200/50 dark:border-pink-800/30' 
          : 'border-slate-200/50 dark:border-slate-700/30'
      } hover:shadow-xl transition-all duration-300`}
    >
      <div className="text-center">
        <div className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-0.5 sm:mb-1 ${
          babyBorn ? 'text-pink-600 dark:text-pink-400' : 'text-indigo-600 dark:text-indigo-400'
        }`}>
          {item.value}
        </div>
        <div className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
          {item.label}
        </div>
      </div>
    </div>
  ))}
</div>
```

### 4. Button Patterns

```tsx
// Primary action button
<Button className={`h-10 sm:h-12 px-6 sm:px-8 ${
  babyBorn
    ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700'
    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
} text-white border-0 font-medium transition-all duration-300`}>
  Primary Action
</Button>

// Secondary/Ghost button
<Button variant="ghost" className={`h-10 sm:h-12 px-4 sm:px-6 ${
  babyBorn 
    ? 'text-pink-700 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/20' 
    : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
} transition-colors duration-200`}>
  Secondary Action
</Button>
```

### 5. Form Input Pattern

```tsx
// Form field with responsive design
<div className="space-y-2">
  <Label 
    htmlFor="input-id" 
    className={`text-sm font-medium ${
      babyBorn ? 'text-pink-700 dark:text-pink-300' : 'text-slate-700 dark:text-slate-300'
    }`}
  >
    Field Label
  </Label>
  <Input 
    id="input-id"
    className={`h-10 sm:h-12 border-2 transition-colors duration-200 focus:ring-2 focus:ring-offset-2 ${
      babyBorn 
        ? 'border-pink-200 dark:border-pink-700 focus:border-pink-500 focus:ring-pink-500/20' 
        : 'border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20'
    }`}
    placeholder="Enter value..."
  />
</div>
```

### 6. Loading State Pattern

```tsx
// Loading spinner/skeleton
{loading ? (
  <div className="flex min-h-screen items-center justify-center">
    <div className={`h-8 w-8 animate-spin rounded-full border-4 border-t-transparent ${
      babyBorn 
        ? 'border-pink-600' 
        : 'border-indigo-600'
    }`}></div>
  </div>
) : (
  // Content when loaded
)}
```

### 7. Avatar/User Info Pattern

```tsx
// User avatar with context-aware styling
<Avatar className={`h-8 w-8 sm:h-10 sm:w-10 border-2 ${
  babyBorn 
    ? 'border-pink-200 dark:border-pink-700' 
    : 'border-indigo-200 dark:border-indigo-700'
}`}>
  <AvatarImage src={user?.photoURL} alt={user?.displayName} />
  <AvatarFallback className={`text-sm font-medium ${
    babyBorn 
      ? 'bg-pink-100 dark:bg-pink-800 text-pink-700 dark:text-pink-200' 
      : 'bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200'
  }`}>
    {initials}
  </AvatarFallback>
</Avatar>
```

### 8. Badge/Tag Pattern

```tsx
// Status badge with theme awareness
<Badge 
  variant="secondary"
  className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-bold transition-colors ${
    babyBorn 
      ? 'bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/50 dark:to-purple-900/50 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700' 
      : 'bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700'
  }`}
>
  Badge Text
</Badge>
```

### 9. Navigation Link Pattern

```tsx
// Navigation link with active state
<Link
  href="/path"
  className={`mobile-menu-item flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors ${
    isActive 
      ? (babyBorn ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-pink-200' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200')
      : (babyBorn ? 'text-pink-700 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/20' : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20')
  }`}
>
  <Icon className="h-5 w-5 mr-3" />
  Link Text
</Link>
```

### 10. Modal/Dialog Pattern

```tsx
// Modal with backdrop and responsive design
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className={`sm:max-w-md mx-4 ${
    babyBorn 
      ? 'bg-pink-50 dark:bg-pink-950 border-pink-200 dark:border-pink-800' 
      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
  }`}>
    <DialogHeader>
      <DialogTitle className={`text-lg font-semibold ${
        babyBorn ? 'text-pink-800 dark:text-pink-200' : 'text-slate-800 dark:text-slate-200'
      }`}>
        Dialog Title
      </DialogTitle>
    </DialogHeader>
    
    <div className="py-4">
      {/* Dialog content */}
    </div>
    
    <DialogFooter className="flex gap-2 sm:gap-3">
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button className={babyBorn ? 'bg-pink-600 hover:bg-pink-700' : 'bg-indigo-600 hover:bg-indigo-700'}>
        Confirm
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Typography Examples

```tsx
// Heading hierarchy
<h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
  Main Title
</h1>

<h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3">
  Section Title  
</h2>

<h3 className="text-base sm:text-lg font-medium mb-2">
  Subsection Title
</h3>

<p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
  Body text with good readability and proper contrast.
</p>

<small className="text-xs sm:text-sm text-slate-500 dark:text-slate-500">
  Helper text or captions
</small>
```

## Animation Classes

```tsx
// Custom animation classes (defined in CSS)
<div className="baby-born-heart">        // Pulsing heart
<div className="baby-born-rainbow">      // Rainbow text gradient  
<div className="baby-born-badge-animated"> // Badge entrance
<div className="baby-born-counter-seconds"> // Number updates

// Standard transitions
<div className="transition-all duration-300">      // Standard smooth
<div className="transition-colors duration-200">   // Fast color change
<div className="hover:scale-105 transition-transform"> // Hover scale
```

## Responsive Breakpoint Examples

```tsx
// Mobile-first responsive classes
className="
  text-sm sm:text-base md:text-lg lg:text-xl     // Text scaling
  p-2 sm:p-4 md:p-6 lg:p-8                      // Padding scaling  
  grid-cols-1 sm:grid-cols-2 lg:grid-cols-3     // Grid responsive
  gap-2 sm:gap-3 md:gap-4 lg:gap-6             // Gap scaling
  h-10 sm:h-12 lg:h-14                         // Height scaling
  max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl  // Width constraints
"
```

Use these patterns as templates when creating new components or pages. Always start with the mobile experience and progressively enhance for larger screens while maintaining the context-aware theming (normal vs celebration mode).
