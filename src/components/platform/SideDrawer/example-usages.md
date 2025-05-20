# SideDrawer Example Usages

This document provides practical examples of using the SideDrawer component in various scenarios.

## Basic Usage

The simplest way to use the SideDrawer is with a header and body component:

```tsx
import { useSideDrawer } from "~/components/platform/SideDrawer";

function BasicExample() {
  const { openSideDrawer } = useSideDrawer();

  const handleOpenDrawer = () => {
    openSideDrawer({
      header: <h2 className="text-lg font-semibold">Basic Drawer</h2>,
      body: {
        component: () => <div className="p-4">This is a basic drawer with default settings.</div>
      }
    });
  };

  return <button onClick={handleOpenDrawer}>Open Basic Drawer</button>;
}
```

## Custom Width

You can specify a custom width for the drawer:

```tsx
function CustomWidthExample() {
  const { openSideDrawer } = useSideDrawer();

  const handleOpenDrawer = () => {
    openSideDrawer({
      header: <h2 className="text-lg font-semibold">Custom Width Drawer</h2>,
      sideDrawerWidth: "500px", // Set a specific width
      body: {
        component: () => <div className="p-4">This drawer has a custom width of 500px.</div>
      }
    });
  };

  return <button onClick={handleOpenDrawer}>Open Custom Width Drawer</button>;
}
```

## With Overlay

Enable a semi-transparent overlay behind the drawer:

```tsx
function OverlayExample() {
  const { openSideDrawer } = useSideDrawer();

  const handleOpenDrawer = () => {
    openSideDrawer({
      header: <h2 className="text-lg font-semibold">Overlay Drawer</h2>,
      overlayEnabled: true, // Enable the overlay
      body: {
        component: () => <div className="p-4">This drawer has an overlay behind it.</div>
      }
    });
  };

  return <button onClick={handleOpenDrawer}>Open Drawer with Overlay</button>;
}
```

## With Close Callback

Execute a function when the drawer is closed:

```tsx
function CloseCallbackExample() {
  const { openSideDrawer } = useSideDrawer();

  const handleOpenDrawer = () => {
    openSideDrawer({
      header: <h2 className="text-lg font-semibold">Close Callback Drawer</h2>,
      body: {
        component: () => <div className="p-4">Close this drawer to trigger the callback.</div>
      },
      onCloseSideDrawer: () => {
        console.log("Drawer was closed!");
        // Perform actions after drawer closes
      }
    });
  };

  return <button onClick={handleOpenDrawer}>Open Drawer with Close Callback</button>;
}
```

## Passing Props to Body Component

Pass props to the body component:

```tsx
// Define a component that accepts props
function DetailView({ id, name, onUpdate }) {
  return (
    <div className="p-4">
      <h3>Details for: {name}</h3>
      <p>ID: {id}</p>
      <button onClick={() => onUpdate(id)}>Update</button>
    </div>
  );
}

function PassingPropsExample() {
  const { openSideDrawer } = useSideDrawer();

  const handleUpdate = (id) => {
    console.log(`Updating item ${id}`);
  };

  const handleOpenDrawer = () => {
    openSideDrawer({
      header: <h2 className="text-lg font-semibold">User Details</h2>,
      body: {
        component: DetailView,
        componentProps: {
          id: "12345",
          name: "John Doe",
          onUpdate: handleUpdate
        }
      }
    });
  };

  return <button onClick={handleOpenDrawer}>View User Details</button>;
}
```

## Resizable Drawer

Enable drawer resizing with a visible handle:

```tsx
function ResizableDrawerExample() {
  const { openSideDrawer } = useSideDrawer();

  const handleOpenDrawer = () => {
    openSideDrawer({
      header: <h2 className="text-lg font-semibold">Resizable Drawer</h2>,
      sideDrawerWidth: "400px", // Initial width
      body: {
        component: () => (
          <div className="p-4">
            <p>This drawer can be resized by dragging the left edge.</p>
            <p>Try dragging the handle on the left side to resize!</p>
          </div>
        )
      },
      resizable: true, // Enable resizing
      showResizeHandle: true // Show the resize handle
    });
  };

  return <button onClick={handleOpenDrawer}>Open Resizable Drawer</button>;
}
```

## Resizable with Hidden Handle

Enable resizing but hide the visual handle:

```tsx
function HiddenHandleExample() {
  const { openSideDrawer } = useSideDrawer();

  const handleOpenDrawer = () => {
    openSideDrawer({
      header: <h2 className="text-lg font-semibold">Hidden Handle Drawer</h2>,
      body: {
        component: () => (
          <div className="p-4">
            <p>This drawer can be resized but the handle is invisible.</p>
            <p>Try dragging the left edge to resize!</p>
          </div>
        )
      },
      resizable: true,
      showResizeHandle: false // Hide the resize handle
    });
  };

  return <button onClick={handleOpenDrawer}>Open Drawer with Hidden Handle</button>;
}
```

## Resizable with Min/Max Constraints

Set minimum and maximum width constraints for resizing:

```tsx
function ConstrainedResizeExample() {
  const { openSideDrawer } = useSideDrawer();

  const handleOpenDrawer = () => {
    openSideDrawer({
      header: <h2 className="text-lg font-semibold">Constrained Resize Drawer</h2>,
      sideDrawerWidth: "500px", // Initial width
      body: {
        component: () => (
          <div className="p-4">
            <p>This drawer has resize constraints.</p>
            <p>Minimum width: 400px</p>
            <p>Maximum width: 700px</p>
          </div>
        )
      },
      resizable: true,
      minResizeWidth: "400px", // Minimum width
      maxResizeWidth: "700px" // Maximum width
    });
  };

  return <button onClick={handleOpenDrawer}>Open Constrained Resize Drawer</button>;
}
```

## Form Submission Example

Use the drawer for a form with submission handling:

```tsx
function FormExample() {
  const { openSideDrawer, closeSideDrawer } = useSideDrawer();

  // Form component with submission handling
  const UserForm = ({ onSubmit }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit({ name, email });
    };

    return (
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Submit
        </button>
      </form>
    );
  };

  const handleOpenDrawer = () => {
    openSideDrawer({
      header: <h2 className="text-lg font-semibold">User Form</h2>,
      overlayEnabled: true,
      body: {
        component: UserForm,
        componentProps: {
          onSubmit: (data) => {
            console.log("Form submitted:", data);
            // Process the form data
            alert(`Form submitted for ${data.name}`);
            // Close the drawer after submission
            closeSideDrawer();
          }
        }
      }
    });
  };

  return <button onClick={handleOpenDrawer}>Open Form Drawer</button>;
}
```

## Rich Content Example

Display rich content with multiple components:

```tsx
function RichContentExample() {
  const { openSideDrawer } = useSideDrawer();

  // Rich content component
  const ProductDetails = ({ product }) => {
    return (
      <div className="p-4">
        <div className="mb-4">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-48 object-cover rounded-md"
          />
        </div>
        
        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-4">{product.description}</p>
        
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Specifications</h4>
          <ul className="list-disc pl-5">
            {product.specs.map((spec, index) => (
              <li key={index}>{spec}</li>
            ))}
          </ul>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">${product.price}</span>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
            Add to Cart
          </button>
        </div>
      </div>
    );
  };

  const handleOpenDrawer = () => {
    const productData = {
      name: "Premium Wireless Headphones",
      image: "https://example.com/headphones.jpg",
      description: "High-quality wireless headphones with noise cancellation and premium sound.",
      price: 299.99,
      specs: [
        "Active Noise Cancellation",
        "40-hour battery life",
        "Bluetooth 5.0",
        "Built-in microphone",
        "Foldable design"
      ]
    };

    openSideDrawer({
      header: <h2 className="text-lg font-semibold">Product Details</h2>,
      sideDrawerWidth: "450px",
      overlayEnabled: true,
      body: {
        component: ProductDetails,
        componentProps: {
          product: productData
        }
      },
      resizable: true
    });
  };

  return <button onClick={handleOpenDrawer}>View Product Details</button>;
}
```

## Combining Multiple Features

Combine various features for a comprehensive drawer:

```tsx
function ComprehensiveExample() {
  const { openSideDrawer } = useSideDrawer();

  const handleOpenDrawer = () => {
    openSideDrawer({
      header: (
        <div className="flex items-center space-x-2">
          <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <h2 className="text-lg font-semibold">Advanced Configuration</h2>
        </div>
      ),
      sideDrawerWidth: "550px",
      overlayEnabled: true,
      closeOnOutsideClick: true,
      resizable: true,
      minResizeWidth: "400px",
      maxResizeWidth: "800px",
      body: {
        component: () => (
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-lg font-medium">Comprehensive Example</h3>
              <p className="text-gray-600">
                This example combines multiple features of the SideDrawer:
              </p>
              <ul className="list-disc pl-5 mt-2">
                <li>Custom header with icon</li>
                <li>Overlay background</li>
                <li>Resizable with constraints</li>
                <li>Close on outside click</li>
                <li>Rich content display</li>
              </ul>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Interactive Elements</h4>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md">
                  Primary Action
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 rounded-md">
                  Secondary Action
                </button>
              </div>
            </div>
          </div>
        )
      },
      onCloseSideDrawer: () => {
        console.log("Comprehensive drawer closed");
      }
    });
  };

  return <button onClick={handleOpenDrawer}>Open Comprehensive Drawer</button>;
}
```

## Best Practices

1. **Performance**: For large or complex content, consider lazy loading or pagination.
2. **Accessibility**: Ensure all interactive elements within the drawer are keyboard accessible.
3. **Mobile Responsiveness**: Test your drawer on various screen sizes.
4. **Error Handling**: Include error boundaries for components rendered in the drawer.
5. **State Management**: Be careful with state management when opening/closing drawers.

## Common Patterns

- **Master-Detail**: Use the main view to show a list and the drawer for details.
- **Forms**: Use the drawer for forms that don't need a full page.
- **Contextual Information**: Show additional information without leaving the current page.
- **Multi-step Processes**: Guide users through a process within the drawer.
```