# Divider Component Documentation

## Overview

The `Divider` component is a versatile and flexible React component designed to create visually appealing and configurable dividers. It supports both horizontal and vertical orientations, multiple content types, and various styling options.

## Key Features

- Horizontal and vertical orientation support
- Multiple content positioning options
- Customizable line styles and colors
- Flexible content placement
- Accessibility-enhanced

## Props Interface

### `DividerProps`

| Prop Name | Type | Default | Description |
|-----------|------|---------|-------------|
| `content` | `DividerItem` or `DividerItem[]` | `undefined` | Content to be displayed within or alongside the divider |
| `variant` | `"solid" \| "dashed" \| "dotted"` | `"solid"` | Style of the divider line |
| `position` | `"left" \| "center" \| "right" \| "top" \| "bottom"` | `"center"` | Position of content relative to the divider |
| `className` | `string` | `undefined` | Additional CSS classes to apply to the divider |
| `contentColor` | `string` | `"white"` | Background color for content areas |
| `lineColor` | `string` | `"#CBD5E1"` | Color of the divider line |
| `height` | `string` | `"100px"` | Height of vertical divider |
| `vertical` | `boolean` | `false` | Switch between horizontal and vertical orientation |
| `positionMargin` | `number` | `0` | Margin for positioned content |
| `children` | `React.ReactNode` | `undefined` | Alternative way to provide content |

### `DividerItem` Interface

| Prop Name | Type | Description |
|-----------|------|-------------|
| `content` | `React.ReactNode` | Content to be displayed |
| `position` | `"left" \| "center" \| "right" \| "top" \| "bottom"` | Position of the content item |
| `variant` | `"solid" \| "dashed" \| "dotted"` | Line style for the divider |
| `positionMargin` | `number` | Optional margin for the specific content item |

## Usage Examples

### Basic Horizontal Divider
```tsx
<Divider />
```

### Vertical Divider
```tsx
<Divider vertical height="200px" />
```

### Customized Line Style
```tsx
<Divider variant="dashed" />
<Divider variant="dotted" />
```

### Custom Line Color
```tsx
<Divider lineColor="#3B82F6" />  {/* Blue line */}
<Divider lineColor="red" />      {/* Red line */}
```

### Content Positioning
```tsx
{/* Horizontal with content */}
<Divider 
  content={[
    { content: "Start", position: "left" },
    { content: "Middle", position: "center" },
    { content: "End", position: "right" }
  ]} 
/>

{/* Vertical with content */}
<Divider 
  vertical
  content={[
    { content: "Top", position: "top" },
    { content: "Center", position: "center" },
    { content: "Bottom", position: "bottom" }
  ]} 
/>
```

### With Children
```tsx
<Divider>
  <span>Custom Content</span>
</Divider>
```

## Advanced Configuration

### Line Style Variants
- `solid`: Standard continuous line
- `dashed`: Segmented line with dashes
- `dotted`: Line composed of dots

### Positioning Strategies
- `left/right` for horizontal alignment
- `top/bottom` for vertical alignment
- `center` as default positioning

## Accessibility Features
- `role="separator"` for screen readers
- `aria-orientation` to indicate line direction
- Semantic HTML structure

## Performance Considerations
- Lightweight component
- Minimal rendering overhead
- Flexible prop types
- Efficient class name management with `cn()` utility

## Best Practices
- Use consistent color schemes
- Ensure sufficient color contrast
- Choose appropriate line styles
- Consider content readability

## Customization Tips
- Combine `variant`, `lineColor`, and `contentColor`
- Adjust `positionMargin` for precise spacing
- Leverage `vertical` prop for unique layouts