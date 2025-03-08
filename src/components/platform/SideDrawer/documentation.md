# SideDrawer Component Documentation

## Overview
The **SideDrawer** is a reusable, dynamic, and customizable drawer component that slides in from the right side of the screen. It supports customizable content, animations, accessibility features, and resizing capabilities.

---

## Features
- **Customizable Width**: Adjust width via the `sideDrawerWidth` prop.
- **Dynamic Content**: Render any React component as body content.
- **Header with Title and Close Button**: Includes a customizable title and close button.
- **Smooth Animations**: Slides in/out with CSS transitions.
- **Overlay Mode**: Floats over main content with a semi-transparent overlay.
- **Accessibility**: ARIA attributes and keyboard navigation included.
- **Callback on Close**: Trigger a callback when the drawer closes.
- **Reusable API**: Open the drawer from anywhere using `openSideDrawer`.
- **Card Style Integration**: Uses a `Card` component for consistent styling.
- **Resizable Drawer**: Dynamically resize the drawer with a draggable handle.
- **Configurable Resize Constraints**: Set minimum and maximum resize widths.

---

## Props and Configuration

### `openSideDrawer` Function
| Prop | Type | Description |
|--|--|--|
| `header` | `ReactNode` | Content displayed in the header. |
| `sideDrawerWidth` | `string` (optional) | Width of the SideDrawer (e.g., `"25dvw"`, `"400px"`). Default: `"982px"`. |
| `body` | `object` | Configuration for the body content. |
| `body.component` | `React.ComponentType` | React component to render as the body content. |
| `body.componentProps` | `object` (optional) | Props to pass to the body component. |
| `onCloseSideDrawer` | `function` (optional) | Callback function triggered when the SideDrawer closes. |
| `overlayEnabled` | `boolean` (optional) | Whether to show a semi-transparent overlay behind the drawer. Default: `false`. |
| `closeOnOutsideClick` | `boolean` (optional) | Whether to close the drawer when clicking outside. Default: `true`. |
| `resizable` | `boolean` (optional) | Enable drawer resizing. Default: `false`. |
| `showResizeHandle` | `boolean` (optional) | Show the resize handle grip icon. Default: `true`. |
| `minResizeWidth` | `string` (optional) | Minimum width when resizing. Default: Same as `sideDrawerWidth`. |
| `maxResizeWidth` | `string` (optional) | Maximum width when resizing. Default: Window width minus sidebar. |
| `metaData` | `any` (optional) | Additional data to store with the drawer configuration. |

---

## Usage

### Step 1: Wrap Your Application with `SideDrawerProvider`
```tsx
import { SideDrawerProvider } from "~/components/platform/SideDrawer";

function App() {
  return (
    <SideDrawerProvider>
      {/* Your application components */}
    </SideDrawerProvider>
  );
}

import { useSideDrawer } from "~/components/platform/SideDrawer";
import PermissionForm from "~/components/PermissionForm";

function SomeComponent() {
  const { openSideDrawer } = useSideDrawer();

  const handleOpenSideDrawer = () => {
    openSideDrawer({
      header: <h2>Assign Permission</h2>,
      sideDrawerWidth: "30dvw",
      body: {
        component: PermissionForm,
        componentProps: {
          userId: "123",
          onSave: (data) => console.log("Saved data:", data),
        },
      },
      onCloseSideDrawer: () => console.log("SideDrawer closed!"),
      resizable: true,
      minResizeWidth: "300px",
      maxResizeWidth: "600px",
    });
  };

  return <button onClick={handleOpenSideDrawer}>Open SideDrawer</button>;
}
```

### Resizable Drawer Example
```tsx
// Example with resizable drawer configuration
openSideDrawer({
  header: <h2>Resizable Panel</h2>,
  sideDrawerWidth: "400px", // Initial width
  body: {
    component: DetailPanel,
    componentProps: { id: "123" },
  },
  resizable: true, // Enable resizing
  showResizeHandle: true, // Show the grip handle (can be set to false for invisible handle)
  minResizeWidth: "300px", // Minimum width constraint
  maxResizeWidth: "800px", // Maximum width constraint
  overlayEnabled: true,
});
```

## Accessibility
- **ARIA Attributes**: Includes `role="dialog"`, `aria-labelledby`, and `aria-modal="true"`.
- **Keyboard Navigation**: Close with clicking outside the sidedrawer or by focusing the close button.

## Styling
The SideDrawer uses a Card component for styling. Customize it by modifying the Card component or adding custom CSS classes.

## Example Use Cases
- **Forms**: Edit user permissions or contact details.
- **Notifications**: Show a list of notifications.
- **Settings**: Configure application preferences.
- **Details Panel**: Display additional item details with resizable width.
- **Document Preview**: View documents with adjustable width for better reading.

## Limitations
- Slides in from the right side only.
- Overlay covers the entire screen.

## Future Enhancements
- **Left-Side Support**: Add support for sliding in from the left.
- **Custom Overlay**: Allow customization of overlay opacity and color.
