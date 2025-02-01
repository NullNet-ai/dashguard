# SideDrawer Component Documentation

## Overview
The **SideDrawer** is a reusable, dynamic, and customizable drawer component that slides in from the right side of the screen. It supports customizable content, animations, and accessibility features.

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

---

## Props and Configuration

### `openSideDrawer` Function
| Prop               | Type                     | Description                                                                 |
|--------------------|--------------------------|-----------------------------------------------------------------------------|
| `title`            | `string`                 | Title displayed in the header.                                              |
| `sideDrawerWidth`  | `string` (optional)      | Width of the SideDrawer (e.g., `"25dvw"`, `"400px"`). Default: `"982px"`.   |
| `body`             | `object`                 | Configuration for the body content.                                         |
| `body.component`   | `React.ComponentType`    | React component to render as the body content.                              |
| `body.componentProps` | `object` (optional)   | Props to pass to the body component.                                        |
| `onCloseCallback`  | `function` (optional)    | Callback function triggered when the SideDrawer closes.                     |

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
      title: "Assign > Permission",
      width: "30dvw",
      body: {
        component: PermissionForm,
        componentProps: {
          userId: "123",
          onSave: (data) => console.log("Saved data:", data),
        },
      },
      onCloseCallback: () => console.log("SideDrawer closed!"),
    });
  };

  return <button onClick={handleOpenSideDrawer}>Open SideDrawer</button>;
}

***************************************************************************************************************************

Accessibility
ARIA Attributes: Includes role="dialog", aria-labelledby, and aria-modal="true".

Keyboard Navigation: Close with clicking outside the sidedrawer or by focusing the close button.

Styling
The SideDrawer uses a Card component for styling. Customize it by modifying the Card component or adding custom CSS classes.

Example Use Cases
Forms: Edit user permissions or contact details.

Notifications: Show a list of notifications.

Settings: Configure application preferences.

Details Panel: Display additional item details.

Limitations
Slides in from the right side only.

Overlay covers the entire screen.

Future Enhancements
Left-Side Support: Add support for sliding in from the left.

Custom Overlay: Allow customization of overlay opacity and color.

Resizable Drawer: Add support for resizing the drawer dynamically.


---

### **How to Add This to Your Repository**
1. Create a new file in your repository, e.g., `SideDrawer.md`.
2. Copy and paste the above Markdown content into the file.
3. Save the file and push it to your repository.

---

### **Why Use Markdown?**
- **Lightweight**: Easy to write and read.
- **Supports Tables**: Perfect for documenting props and configurations.
- **Rendered by GitHub**: GitHub automatically renders `.md` files with proper formatting.
- **Widely Supported**: Most code editors (e.g., VSCode) have built-in Markdown preview.

---

### **Alternative Formats**
If you need more advanced features (e.g., interactive documentation), you can consider:
1. **HTML**: For richer formatting but harder to maintain.
2. **PDF**: For printable documentation.
3. **JSON/YAML**: For structured data, but not human-readable.

For most cases, **Markdown** is the best choice for documentation in a repository. Let me know if you need further assistance!