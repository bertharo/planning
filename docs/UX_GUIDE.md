# LRP Prototype - UX Design System Guide

## Overview

This document outlines the Apple-quality design system implemented in the LRP Prototype, following modern design principles for clarity, deference, depth, and accessibility.

## Design Philosophy

### Core Principles
- **Clarity**: Ruthless simplicity; remove visual noise
- **Deference**: Content first, UI recedes  
- **Depth**: Subtle, meaningful motion and layering
- **Typography**: Inter font tuned to feel like SF Pro
- **Accessibility**: WCAG 2.2 AA compliance

## Design Tokens

### Color System
Our semantic color system uses CSS custom properties for consistent theming:

```css
/* Light Theme */
--bg: 255 255 255;
--fg: 17 24 39;
--muted: 246 247 249;
--muted-fg: 107 114 128;
--card: 255 255 255;
--border: 229 231 235;
--ring: 59 130 246;
--accent: 20 110 255;
--primary: 59 130 246;

/* Dark Theme */
--bg: 10 10 12;
--fg: 235 236 240;
--muted: 18 18 22;
--muted-fg: 156 163 175;
--card: 16 16 19;
--border: 38 38 42;
--ring: 93 156 255;
--accent: 80 120 255;
--primary: 93 156 255;
```

### Spacing Scale
Consistent 4px-based spacing system:
- `4px` - xs
- `8px` - sm  
- `12px` - md
- `16px` - lg
- `24px` - xl
- `32px` - 2xl
- `48px` - 3xl

### Border Radius
- `rounded-sm` (4px) - Small elements
- `rounded-md` (6px) - Default elements
- `rounded-lg` (8px) - Buttons, inputs
- `rounded-xl` (12px) - Cards, containers
- `rounded-2xl` (16px) - Large containers

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Line Height**: Optimized for readability
- **Font Features**: Ligatures and contextual alternates enabled

## Component Library

### Core Components

#### Button
- **Variants**: primary, secondary, ghost, destructive, outline
- **Sizes**: sm, md, lg, icon
- **States**: default, hover, active, disabled, loading
- **Accessibility**: Focus rings, ARIA attributes

#### Card
- **Structure**: Header, Content, Footer slots
- **Styling**: Subtle shadows, rounded corners
- **Interactive**: Hover effects for better UX

#### Input/Textarea
- **States**: default, focus, error, disabled
- **Accessibility**: Proper labels, error messages
- **Styling**: Consistent focus rings

#### Tabs
- **Navigation**: Keyboard accessible
- **Styling**: Pill-style active states
- **Content**: Smooth transitions

### Motion System

#### Animation Principles
- **Duration**: 150-220ms for micro-interactions
- **Easing**: Natural spring curves
- **Reduced Motion**: Respects user preferences
- **Performance**: GPU-accelerated transforms

#### Standard Transitions
```typescript
fadeIn: { opacity: 0 → 1, duration: 200ms }
fadeInScale: { opacity: 0→1, scale: 0.95→1, duration: 200ms }
slideUp: { opacity: 0→1, y: 20→0, duration: 300ms }
```

#### Motion Components
- `MotionCard`: Entrance animations for cards
- `MotionList`: Staggered list animations
- `MotionItem`: Individual item animations

## Layout System

### App Shell
- **Header**: Sticky navigation with backdrop blur
- **Content**: Responsive grid system
- **Spacing**: Generous padding and margins
- **Max Width**: Container constraints for readability

### Grid System
- **Breakpoints**: Mobile-first responsive design
- **Columns**: 12-column grid on large screens
- **Gaps**: Consistent spacing between elements

### Navigation
- **Desktop**: Full navigation with labels
- **Mobile**: Icon-only navigation with tooltips
- **Active States**: Clear visual feedback
- **Keyboard**: Full keyboard navigation support

## Accessibility Features

### WCAG 2.2 AA Compliance
- **Color Contrast**: 4.5:1 minimum ratio
- **Focus Management**: Visible focus indicators
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA attributes
- **Motion**: Respects prefers-reduced-motion

### Keyboard Shortcuts
- `Tab/Shift+Tab`: Navigate between interactive elements
- `Enter/Space`: Activate buttons and links
- `Escape`: Close modals and dropdowns
- `Arrow Keys`: Navigate within components

### Focus Management
- **Focus Rings**: 2px ring with offset
- **Focus Trap**: Modal and dialog focus containment
- **Skip Links**: Available for screen readers

## Theming System

### Theme Provider
- **System Detection**: Automatically detects user preference
- **Manual Override**: Theme toggle in header
- **Persistence**: Remembers user choice
- **Smooth Transitions**: No jarring theme switches

### Dark Mode
- **Semantic Colors**: All colors adapt to theme
- **Contrast**: Maintains accessibility standards
- **Images**: Optimized for both themes
- **Custom Properties**: Easy theme customization

## Performance Optimizations

### Font Loading
- **Google Fonts**: Optimized loading with display=swap
- **Font Features**: Enabled ligatures and alternates
- **Fallbacks**: System font stack for reliability

### Motion Performance
- **GPU Acceleration**: Uses transform and opacity
- **Reduced Motion**: Respects accessibility preferences
- **Debouncing**: Prevents excessive animations

### Bundle Optimization
- **Tree Shaking**: Only imports used components
- **Code Splitting**: Lazy loading for heavy components
- **Dependencies**: Minimal, focused package selection

## Usage Examples

### Creating a Card
```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

### Using Motion
```tsx
import { MotionCard } from '@/components/ui/motion'

<MotionCard>
  Content with entrance animation
</MotionCard>
```

### Theme Toggle
```tsx
import { ThemeToggle } from '@/components/ThemeToggle'

<ThemeToggle />
```

## Best Practices

### Component Usage
1. Use semantic HTML elements
2. Provide proper ARIA labels
3. Ensure keyboard accessibility
4. Test with screen readers
5. Validate color contrast

### Motion Guidelines
1. Keep animations short (150-220ms)
2. Use spring easing for natural feel
3. Respect reduced motion preferences
4. Test on slower devices
5. Provide loading states

### Theming
1. Use semantic color tokens
2. Test both light and dark themes
3. Ensure sufficient contrast
4. Consider color-blind users
5. Validate with accessibility tools

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **CSS Features**: CSS Grid, Flexbox, Custom Properties
- **JavaScript**: ES2020+ features
- **Accessibility**: Screen reader compatible

## Tools and Resources

### Development
- **Design System**: Tailwind CSS + Custom Components
- **Motion**: Framer Motion
- **Icons**: Lucide React
- **Theming**: next-themes
- **Accessibility**: Built-in ARIA support

### Testing
- **Lighthouse**: Performance and accessibility audits
- **Axe**: Accessibility testing
- **Keyboard Testing**: Manual keyboard navigation
- **Screen Readers**: NVDA, JAWS, VoiceOver

## Future Enhancements

### Planned Features
- [ ] Command Palette (⌘K)
- [ ] Advanced animations
- [ ] More theme variants
- [ ] Component playground
- [ ] Design token documentation

### Accessibility Improvements
- [ ] High contrast mode
- [ ] Font size scaling
- [ ] Additional keyboard shortcuts
- [ ] Voice navigation support
- [ ] Haptic feedback

---

*This design system ensures the LRP Prototype delivers a premium, accessible user experience that rivals the best consumer applications.*
