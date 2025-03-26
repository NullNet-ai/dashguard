# CardComponent Documentation

## Overview

The `CardComponent` is a flexible and customizable React component designed to create versatile card layouts with optional header, body, footer, and cover image sections. It supports dynamic rendering, loading states, and customizable styling.

## Props Interface

```typescript
interface CardsProps {
  headerContent?: React.ReactNode;     // Optional content for the card header
  footerContent?: React.ReactNode;     // Optional content for the card footer
  coverImage?: string | React.ReactNode; // Cover image as a string URL or React element
  body?: string | React.ReactNode;     // Main content of the card
  className?: string;                  // Additional CSS classes
  maxWidth?: string;                   // Maximum width of the card (default: '375px')
  onClick?: () => void;                // Optional click event handler
  loading?: boolean;                   // Determines if the card is in a loading state
}
```

## Key Features

### Flexible Content Rendering
- Supports rendering header, body, and footer content dynamically
- Can accept both string and React node types for content
- Conditionally renders sections based on provided props

### Image Handling
- Supports two image rendering modes:
  1. String URL: Uses Next.js `Image` component with fill and cover properties
  2. React Node: Allows custom image or image-like content

### Loading State
- Displays a skeleton loader when `loading` prop is `true`
- Provides a smooth user experience during data fetching

### Styling and Interaction
- Uses Tailwind CSS classes for styling
- Supports custom CSS classes via `className` prop
- Configurable maximum width
- Optional click handler with cursor style changes

## Usage Examples

### Basic Card with Image and Content
```tsx
<CardComponent
  coverImage="/path/to/image.jpg"
  headerContent={<h2>Card Title</h2>}
  body={<p>This is the main content of the card.</p>}
  footerContent={<button>Learn More</button>}
/>
```

### Clickable Card
```tsx
<CardComponent
  onClick={() => handleCardClick()}
  body={<p>Click me to trigger an action!</p>}
/>
```

### Loading State
```tsx
<CardComponent loading={isDataLoading} />
```

## Implementation Details

### Conditional Rendering
The component uses conditional rendering to:
- Show/hide sections based on prop availability
- Render loading skeleton when `loading` is true
- Apply different image rendering strategies

### Styling Approach
- Utilizes `cn()` utility for dynamic class composition
- Applies responsive and flexible layout
- Supports cursor change on clickable cards

## Best Practices

1. Always provide meaningful content for each section
2. Use loading states to improve user experience
3. Ensure cover images are optimized for performance
4. Leverage TypeScript for type safety

## Dependencies
- React
- Next.js Image component
- Tailwind CSS
- Custom utility functions (`cn()`)
- Local components: `Card`, `Skeleton`

## Potential Improvements
- Add prop for controlling image aspect ratio
- Implement more granular loading states
- Create more flexible styling options

## Accessibility Considerations
- Ensure clickable cards have appropriate aria attributes
- Provide meaningful alt text for images
- Consider keyboard navigation for interactive cards