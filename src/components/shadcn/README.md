# shadcn/ui Components

This folder contains all the shadcn/ui components configured for this project.

## Usage

You can import components individually:

```tsx
import { Button } from '@/components/shadcn/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn/card'
```

Or import multiple components from the index file:

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn'
```

## Available Components

- **Accordion** - Collapsible content sections
- **Alert** - Important messages and notifications
- **Alert Dialog** - Modal dialogs for important actions
- **Avatar** - User profile pictures
- **Badge** - Small status indicators
- **Breadcrumb** - Navigation breadcrumbs
- **Button** - Interactive buttons with variants
- **Calendar** - Date picker calendar
- **Card** - Content containers
- **Carousel** - Image/content sliders
- **Checkbox** - Form checkboxes
- **Collapsible** - Expandable content
- **Command** - Command palette interface
- **Context Menu** - Right-click menus
- **Dialog** - Modal dialogs
- **Drawer** - Slide-out panels
- **Dropdown Menu** - Dropdown menus
- **Form** - Form components with validation
- **Hover Card** - Hover-triggered cards
- **Input** - Text input fields
- **Label** - Form labels
- **Menubar** - Application menu bars
- **Navigation Menu** - Navigation components
- **Pagination** - Page navigation
- **Popover** - Floating content panels
- **Progress** - Progress indicators
- **Radio Group** - Radio button groups
- **Resizable** - Resizable panels
- **Scroll Area** - Custom scrollable areas
- **Select** - Dropdown selectors
- **Separator** - Visual dividers
- **Sheet** - Slide-out sheets
- **Skeleton** - Loading placeholders
- **Slider** - Range sliders
- **Sonner** - Toast notifications
- **Switch** - Toggle switches
- **Table** - Data tables
- **Tabs** - Tabbed interfaces
- **Textarea** - Multi-line text inputs
- **Toggle** - Toggle buttons
- **Tooltip** - Hover tooltips

## Configuration

The components are configured with:
- **Style**: New York
- **Base Color**: Neutral
- **CSS Variables**: Enabled
- **Icon Library**: Lucide React

## Dependencies

All required dependencies have been automatically installed:
- `@radix-ui/*` - UI primitives
- `class-variance-authority` - Component variants
- `clsx` - Conditional classes
- `tailwind-merge` - Tailwind class merging
- `lucide-react` - Icons 