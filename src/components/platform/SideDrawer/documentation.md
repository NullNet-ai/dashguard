
# SideDrawer Component

## Overview

The SideDrawer is a flexible, configurable drawer component that can be opened from the side of the screen. It supports:

- Pinning to keep the drawer persistent across page navigation
- Resizing with configurable min/max widths
- Type-specific configurations and persistence
- Component registry for easy reuse
- Customizable headers and content

## Usage

### Basic Usage

```tsx
import { useSideDrawer, registerDrawerType } from './SideDrawerProvider';

// Register a drawer type (typically done once during app initialization)
registerDrawerType('my-drawer', {
  component: MyDrawerContent,
  header: <h2>My Drawer</h2>,
  options: {
    sideDrawerWidth: '500px',
    resizable: true,
    isPinnable: true
  },
  componentProps: { initialData: 'some-value' }
});

// Using the drawer in a component
function MyComponent() {
  const { actions } = useSideDrawer();
  
  const handleOpenDrawer = () => {
    // Open by type (simplest approach)
    actions.openSideDrawer('my-drawer');
    
    // Or open with custom config
    actions.openSideDrawer({
      header: <h2>Custom Header</h2>,
      body: {
        component: MyDrawerContent,
        componentProps: { customData: 'value' }
      },
      sideDrawerWidth: '600px',
      drawerType: 'my-custom-drawer'
    });
  };
  
  return (
    <button onClick={handleOpenDrawer}>Open Drawer</button>
  );
}
```

### Setup

Wrap your application with the SideDrawerProvider:

```tsx
import { SideDrawerProvider } from './SideDrawerProvider';

function App() {
  return (
    <SideDrawerProvider>
      {/* Your app content */}
    </SideDrawerProvider>
  );
}
```

## API Reference

### SideDrawerProvider

The main provider component that manages the drawer state and provides the context.

```tsx
<SideDrawerProvider>
  {children}
</SideDrawerProvider>
```

### useSideDrawer Hook

```tsx
const { state, actions } = useSideDrawer();
```

#### State Properties

- `isOpen`: Boolean indicating if the drawer is currently open
- `config`: The current drawer configuration or null if closed
- `isPinned`: Boolean indicating if the drawer is pinned
- `width`: The current width of the drawer

#### Actions

- `openSideDrawer(configOrType)`: Opens the drawer with the specified config or type
- `closeSideDrawer()`: Closes the drawer
- `togglePinSideDrawer()`: Toggles the pinned state of the drawer
- `saveCurrentState(config)`: Saves the current drawer state
- `setwidth(width)`: Sets the drawer width

### registerDrawerType

Registers a drawer type for later use.

```tsx
registerDrawerType(drawerType, {
  component: React.ComponentType<any>,
  header: React.ReactNode | (() => React.ReactNode),
  options?: Partial<Omit<ISideDrawerConfig, 'body' | 'header'>>,
  componentProps?: Record<string, any>
});
```

### ISideDrawerConfig Interface

```tsx
interface ISideDrawerConfig {
  header: ReactNode;
  sideDrawerWidth?: string;
  body: {
    component: React.ComponentType<any> | Promise<() => Element>;
    componentProps?: Record<string, any>;
  };
  onCloseSideDrawer?: () => void;
  onPinStateChange?: (isPinned: boolean) => void;
  overlayEnabled?: boolean;
  closeOnOutsideClick?: boolean;
  resizable?: boolean;
  showResizeHandle?: boolean;
  minResizeWidth?: string;
  maxResizeWidth?: string;
  isPinnable?: boolean;
  drawerType?: string;
}
```

## Persistence

The SideDrawer component persists its state in localStorage with the following keys:

- Type-specific width: `sideDrawer_width_[type]`
- Type-specific pinned state: `sideDrawer_isPinned_[type]`
- General drawer state: `sideDrawer_isOpen`, `sideDrawer_config`, etc.

When a drawer is pinned, its configuration, width, and content are preserved across page reloads.

## Advanced Features

### Resizable Drawers

Set `resizable: true` in the drawer config to allow users to resize the drawer. You can also set:

- `minResizeWidth`: Minimum allowed width (e.g., "300px")
- `maxResizeWidth`: Maximum allowed width (e.g., "800px")
- `showResizeHandle`: Whether to show a resize handle

### Async Components

The drawer supports async components:

```tsx
actions.openSideDrawer({
  header: <h2>Async Drawer</h2>,
  body: {
    component: import('./LazyComponent').then(module => module.default),
    componentProps: { /* props */ }
  }
});
```

### Callbacks

You can provide callbacks for drawer events:

```tsx
actions.openSideDrawer({
  // ...other config
  onCloseSideDrawer: () => console.log('Drawer closed'),
  onPinStateChange: (isPinned) => console.log('Pin state changed:', isPinned)
});
```
