# Modal Component Documentation

## Overview

The Modal component is a reusable, customizable dialog window that can be used throughout your application. It leverages the AlertDialog component from your UI library and provides a consistent interface for presenting temporary content, collecting user input, or confirming actions.

## Import

```jsx
import Modal from '~/components/ui/modal';
```

## Features

- Customizable positioning (top, center, or bottom of screen)
- Optional close button
- Flexible footer with support for multiple action buttons
- Loading states for both content and actions
- Configurable maximum width
- Custom footer alignment (left, center, right)
- Promise-based action handling

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | boolean | required | Controls whether the modal is visible |
| `onOpenChange` | function | required | Callback when the modal's open state changes |
| `children` | ReactNode | - | Content to display in the modal body |
| `showCloseBtn` | boolean | `true` | Whether to show the close button in the top-right corner |
| `footer` | ReactNode | - | Custom footer content (overrides default footer) |
| `actions` | Array | - | Array of action button configurations |
| `footerPosition` | 'left' \| 'center' \| 'right' | 'right' | Horizontal alignment of footer buttons |
| `onAction` | function | - | Promise function called when default confirm button is clicked |
| `maxWidth` | string | '600px' | Maximum width of the modal |
| `position` | 'top' \| 'center' \| 'bottom' | 'center' | Vertical position of modal |
| `footerStyle` | string | - | Additional CSS classes for the footer |
| `contentLoading` | boolean | `false` | Shows a skeleton loader instead of content when true |
| `className` | string | - | Additional CSS classes for the modal container |

### Action Object Properties

When using the `actions` prop, each action object can have the following properties:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | string | required | Text displayed on the button |
| `onClick` | function | required | Function called when the button is clicked |
| `disabled` | boolean | `false` | Whether the button is disabled |
| `className` | string | - | Additional CSS classes for the button |
| `variant` | 'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'link' | 'default' | Visual style of the button |
| `closeOnAction` | boolean | `true` | Whether to close the modal after the action completes |

## Usage Examples

### Basic Confirmation Modal

```jsx
import { useState } from 'react';
import Modal from '~/components/ui/modal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleConfirm = async () => {
    // Perform confirmation action
    console.log('Confirmed!');
  };
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      <Modal 
        open={isOpen} 
        onOpenChange={setIsOpen}
        onAction={handleConfirm}
      >
        <h2 className="text-lg font-semibold">Confirm Action</h2>
        <p className="mt-2">Are you sure you want to proceed with this action?</p>
      </Modal>
    </>
  );
}
```

### Custom Actions Modal

```jsx
import { useState } from 'react';
import Modal from '~/components/ui/modal';

function CustomActionsModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSave = async () => {
    // Save data
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saved!');
  };
  
  const handleDelete = async () => {
    // Delete data
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Deleted!');
  };
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Manage Item</button>
      
      <Modal 
        open={isOpen} 
        onOpenChange={setIsOpen}
        footerPosition="center"
        actions={[
          {
            label: 'Delete',
            onClick: handleDelete,
            variant: 'destructive',
            className: 'mr-2'
          },
          {
            label: 'Save',
            onClick: handleSave,
            variant: 'default'
          },
          {
            label: 'Cancel',
            onClick: () => {},
            variant: 'outline'
          }
        ]}
      >
        <h2 className="text-xl font-bold mb-4">Item Details</h2>
        <div className="space-y-4">
          {/* Form fields would go here */}
          <p>Content goes here...</p>
        </div>
      </Modal>
    </>
  );
}
```

### Loading State Modal

```jsx
import { useState, useEffect } from 'react';
import Modal from '~/components/ui/modal';

function LoadingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(true);
  
  // Simulate loading content
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsContentLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  return (
    <>
      <button onClick={() => {
        setIsContentLoading(true);
        setIsOpen(true);
      }}>Open Loading Modal</button>
      
      <Modal 
        open={isOpen} 
        onOpenChange={setIsOpen}
        contentLoading={isContentLoading}
        maxWidth="400px"
      >
        <h2 className="text-lg font-semibold">Content Loaded!</h2>
        <p className="mt-2">This content appears after loading completes.</p>
      </Modal>
    </>
  );
}
```

## Implementation Details

The Modal component handles the following responsibilities:

1. **State Management**: Tracks loading state during actions to prevent premature closing
2. **Action Handling**: Provides a promise-based API for handling button clicks
3. **Positioning**: Allows for different vertical positions on the screen
4. **Error Handling**: Captures and logs errors during action execution

The component uses the underlying AlertDialog components from your UI library and enhances them with additional functionality specific to modal dialogs.

## Accessibility

The Modal component follows accessibility best practices:

- Uses proper ARIA labels for the close button
- Traps focus within the modal when open
- Handles keyboard interactions (Escape to close)
- Maintains proper focus management
