# Banner Component

A versatile and customizable notification banner for React applications that can be positioned at the top or bottom of your interface.

## Features

- Configurable positioning (top or bottom)
- Content alignment options (left, center, right)
- Multiple action buttons/links support
- Dismissible with optional persistence
- Sticky positioning capability
- Fully customizable styling

## Installation

This component is intended to be used within your React project. Make sure you have the required dependencies installed:

```bash
npm install heroicons react next
```

## Import

```jsx
import Banner from 'path/to/components/Banner';
```

## Basic Usage

```jsx
import Banner from '../components/Banner';

export default function HomePage() {
  return (
    <main>
      <Banner 
        content="This is an important announcement!"
        contentAlign="center"
      />
      {/* Rest of your page content */}
    </main>
  );
}
```

## Props

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `React.ReactNode` | `"This is where your content goes."` | The main message or content to display in the banner. Can be text or any React component. |
| `contentAlign` | `'left'` \| `'center'` \| `'right'` | `undefined` | Controls the horizontal alignment of the content within the banner. |
| `position` | `'top'` \| `'bottom'` | `'top'` | Determines whether the banner appears at the top or bottom of the viewport. |
| `hideable` | `boolean` | `true` | When true, the banner can be dismissed by the user. |
| `sticky` | `boolean` | `false` | When true, the banner will stay fixed in place while scrolling. |
| `className` | `string` | `'bg-slate-800 text-white'` | Custom CSS classes to apply to the banner container. |
| `maxWidth` | `string` | `undefined` | Sets a maximum width for the banner (e.g., '1200px', '80%', etc.). |
| `actions` | `BtnAction[]` | `undefined` | Array of action buttons or links to display alongside the content. |

### BtnAction Interface

The `actions` prop takes an array of objects with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `type` | `'button'` \| `'link'` \| `'icon'` | Determines the type of action element to render. |
| `icon_position` | `'left'` \| `'right'` | (Optional) Specifies where to place the icon relative to the label. |
| `position` | `'start'` \| `'end'` | (Optional) Controls whether the action appears before or after the main content. |
| `id` | `string` | (Optional) Unique identifier for the action. |
| `label` | `string` | (Optional) Text to display on the action button or link. |
| `href` | `string` | (Optional) URL destination for link-type actions. |
| `btnStyle` | `string` | (Optional) Custom CSS classes to style the action button or link. |
| `icon` | `React.ElementType` | (Optional) Icon component to display with the action. |
| `onClick` | `() => void` | (Optional) Function to call when the action is clicked. |

## Examples

### Informational Banner with Link

```jsx
import Banner from '../components/Banner';
import { ArrowLongRightIcon } from '@heroicons/react/20/solid';

export default function ProductPage() {
  return (
    <>
      <Banner 
        content={<p>New features available! Check out our latest update.</p>}
        contentAlign="left"
        className="bg-blue-600 text-white"
        actions={[
          {
            type: 'link',
            label: 'Learn more',
            href: '/updates',
            position: 'end',
            icon: ArrowLongRightIcon,
            icon_position: 'right',
            btnStyle: 'text-white hover:underline'
          }
        ]}
      />
      {/* Rest of page content */}
    </>
  );
}
```

### Promotional Banner with Multiple Actions

```jsx
import Banner from '../components/Banner';

export default function SalePage() {
  return (
    <>
      <Banner 
        content={<p className="font-bold">Limited time offer: 30% off all products!</p>}
        contentAlign="center"
        className="bg-red-600 text-white"
        sticky={true}
        actions={[
          {
            type: 'button',
            label: 'Shop Now',
            position: 'end',
            btnStyle: 'bg-white text-red-600 hover:bg-gray-100',
            onClick: () => window.location.href = '/products'
          },
          {
            type: 'link',
            label: 'View Terms',
            href: '/terms',
            position: 'end',
            btnStyle: 'text-white underline hover:text-gray-200 ml-4'
          }
        ]}
      />
      {/* Rest of page content */}
    </>
  );
}
```

### Cookie Consent Banner

```jsx
import Banner from '../components/Banner';

export default function Layout({ children }) {
  const handleAcceptCookies = () => {
    // Handle cookie acceptance logic
    console.log('Cookies accepted');
  };
  
  return (
    <>
      {children}
      <Banner 
        content={<p>This website uses cookies to improve your experience.</p>}
        contentAlign="left"
        position="bottom"
        hideable={false}
        sticky={true}
        className="bg-gray-100 text-gray-800 shadow-lg"
        actions={[
          {
            type: 'button',
            label: 'Accept',
            position: 'end',
            btnStyle: 'bg-green-600 text-white hover:bg-green-700',
            onClick: handleAcceptCookies
          }
        ]}
      />
    </>
  );
}
```

## Persistence

The Banner component includes built-in persistence using localStorage when `hideable` is set to `false`. This means the banner will remain hidden after a user dismisses it, even if they refresh the page or return later.

The persistence key is `'banner_hidden'` and is set to `'true'` when the banner is closed. To reset this behavior programmatically, you can use:

```javascript
localStorage.removeItem('banner_hidden');
```

## Accessibility

The Banner component includes several accessibility features:

- The close button includes an `aria-label` for screen readers
- The banner has a `tabIndex` of `-1` to prevent focus when not needed
- Default color combinations provide sufficient contrast ratios

## Styling

The Banner component leverages Tailwind CSS classes for styling. You can customize the appearance by:

1. Using the `className` prop to override default styles
2. Using the `btnStyle` property in action objects to style individual buttons
3. Providing custom components in the `content` prop for more complex styling needs

## Browser Support

The Banner component is compatible with all modern browsers that support:

- React 18+
- ES6 features
- localStorage API

## Notes

- For sticky banners, ensure your layout accommodates the banner height to prevent content overlap
- When using multiple banners, consider z-index management to control stacking order
- The component automatically handles responsive behavior, adapting to different screen sizes