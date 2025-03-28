# Divider Component Documentation

## Overview

The `Divider` component is a flexible and versatile React component designed to create visually appealing and configurable dividers in your user interface. It supports both horizontal and vertical orientations, multiple content types, and various styling options.

## Props Interface

### `DividerProps`

| Prop Name | Type | Default | Description |
|-----------|------|---------|-------------|
| `content` | `DividerItem` or `DividerItem[]` | `undefined` | Content to be displayed within or alongside the divider |
| `variant` | `"solid" \| "dashed" \| "dotted" \| "outlined"` | `"solid"` | Style of the divider line |
| `position` | `"left" \| "center" \| "right" \| "top" \| "bottom"` | `"center"` | Position of content relative to the divider |
| `className` | `string` | `undefined` | Additional CSS classes to apply to the divider |
| `contentColor` | `string` | `"white"` | Background color for content areas |
| `lineColor` | `string` | `"#CBD5E1"` | Color of the divider line |
| `height` | `string` | `"100px"` | Height of vertical divider |
| `vertical` | `boolean` | `false` | Switch between horizontal and vertical orientation |
| `positionMargin` | `number` | `0` | Margin for positioned content |
| `children` | `React.ReactNode` | `undefined` | Alternative way to provide content |

## `DividerItem` Interface

| Prop Name | Type | Description |
|-----------|------|-------------|
| `content` | `React.ReactNode` | Content to be displayed |
| `position` | `"left" \| "center" \| "right" \| "top" \| "bottom"` | Position of the content item |
| `positionMargin` | `number` | Optional margin for the specific content item |

## Usage Examples

### Custom Line Color
```tsx
{/* Default line color (slate-300) */}
<Divider />

{/* Custom line color */}
<Divider lineColor="#3B82F6" />  {/* Blue line */}
<Divider lineColor="red" />      {/* Red line */}
<Divider lineColor="#10B981" />  {/* Green line */}
```

### Combining Line Color with Other Variants
```tsx
{/* Dashed divider with custom color */}
<Divider 
  variant="dashed" 
  lineColor="#6366F1"  {/* Indigo line */}
/>

{/* Dotted divider with custom color */}
<Divider 
  variant="dotted" 
  lineColor="#EC4899"  {/* Pink line */}
/>
```

### Vertical Divider with Custom Line Color
```tsx
<Divider 
  vertical 
  height="200px" 
  lineColor="#8B5CF6"  {/* Purple line */}
  content={[
    { content: "Top", position: "top" },
    { content: "Center", position: "center" },
    { content: "Bottom", position: "bottom" }
  ]} 
/>
```

## Line Color Implementation Details

### Color Specification
- Accepts any valid CSS color value
- Supports:
  - Color names: `"red"`, `"blue"`
  - Hex codes: `"#CBD5E1"`, `"#3B82F6"`
  - RGB/RGBA: `"rgb(59, 130, 246)"`, `"rgba(59, 130, 246, 0.5)"`
  - HSL/HSLA: `"hsl(217, 91%, 60%)"`, `"hsla(217, 91%, 60%, 0.8)"`

### Default Color
- Default value is `"#CBD5E1"` (Tailwind's slate-300)
- Provides a neutral, subtle divider appearance out of the box

## Best Practices for Line Color
- Choose colors that complement your design system
- Ensure sufficient contrast with background
- Use consistent color schemes
- Consider accessibility and readability

## Accessibility Considerations
- Verify color contrast meets WCAG guidelines
- Test with color contrast checking tools
- Provide alternative visual separators if needed

## Performance Notes
- `lineColor` uses inline styling for maximum flexibility
- Minimal performance impact
- Allows dynamic color changes without re-rendering

## Potential Improvements
- Add color validation
- Implement theme-based color selection
- Create predefined color variants