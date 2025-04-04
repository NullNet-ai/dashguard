# CodeEditor Component Documentation

## Overview

The CodeEditor component is a feature-rich code editing interface built on top of Monaco Editor. It provides a highly customizable environment for writing, viewing, and managing code snippets with support for multiple programming languages, themes, and developer-friendly tools.

## Import

```jsx
import CodeEditor from '~/components/ui/code-editor';
```

## Features

- **Multiple Language Support**: JavaScript, TypeScript, Python, SQL, HTML, CSS
- **Theme Options**: Light, Dark, High Contrast Black, High Contrast Light
- **Customizable Appearance**: Adjustable font sizes and display options
- **Developer Tools**: 
  - Code preview panel with resizable split view
  - Show/hide editor functionality
  - Minimap toggle
  - Copy to clipboard with confirmation
  - Read-only/Developer mode toggle
- **Accessibility**: Full keyboard navigation, ARIA attributes, and screen reader support
- **Auto-height Adjustment**: Automatically adjusts height based on content (optional)
- **Error State**: Visual indication for validation errors

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onCodeChange` | `(value: string) => void` | - | Callback function triggered when code content changes |
| `enable_editor_tools` | `boolean` | `true` | Enable or disable the editor toolbar and advanced features |
| `enable_auto_height` | `boolean` | `false` | Enable dynamic height adjustment based on content |
| `readOnly` | `boolean` | `false` | Make the editor read-only |
| `disabled` | `boolean` | `false` | Disable all interactions with the editor |
| `hasError` | `boolean` | `false` | Apply error styling to the editor |
| `defaultTheme` | `'vs-light' \| 'vs-dark' \| 'hc-black' \| 'hc-light'` | `'vs-light'` | Initial theme for the editor |
| `minHeight` | `string` | `'10vh'` | Minimum height of the editor (CSS value) |
| `maxHeight` | `string` | `'50vh'` | Maximum height of the editor (CSS value) |
| `placeholder` | `string` | `'Type your code here...'` | Placeholder text when editor is empty |
| `editorCode` | `string` | `''` | Initial code content |

## Usage Examples

### Basic Usage

```jsx
import { useState } from 'react';
import CodeEditor from '~/components/ui/code-editor';

function MyComponent() {
  const [code, setCode] = useState('// Write your code here');
  
  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };
  
  return (
    <CodeEditor
      editorCode={code}
      onCodeChange={handleCodeChange}
      minHeight="200px"
    />
  );
}
```

### Read-Only Mode

```jsx
import CodeEditor from '~/components/ui/code-editor';

function ReadOnlyExample() {
  const sampleCode = `
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
`;
  
  return (
    <CodeEditor
      editorCode={sampleCode}
      readOnly={true}
      minHeight="150px"
      defaultTheme="vs-dark"
    />
  );
}
```

### Auto-Height with Python Example

```jsx
import CodeEditor from '~/components/ui/code-editor';

function PythonExample() {
  const pythonCode = `
def fibonacci(n):
    """Generate the Fibonacci sequence up to n"""
    a, b = 0, 1
    while a < n:
        yield a
        a, b = b, a + b

# Print the sequence
for num in fibonacci(100):
    print(num)
`;
  
  return (
    <CodeEditor
      editorCode={pythonCode}
      language="python"
      enable_auto_height={true}
      minHeight="100px"
      maxHeight="400px"
    />
  );
}
```

## Implementation Details

### Core Functionality

The CodeEditor component leverages Monaco Editor to provide a rich code editing experience. It manages several state variables:

- Editor appearance (theme, language, font size)
- View options (show/hide editor, preview, minimap)
- Editor mode (developer/read-only)
- Content dimensions

The editor mounts with configurable options that enhance the user experience, including:

- Syntax highlighting
- Bracket pair colorization
- Auto-formatting
- Code lens support
- Smooth scrolling

### Key Components and Functions

1. **Editor Toolbar**: Contains language selector, theme selector, font size selector, and toggle buttons
2. **ResizablePanelGroup**: Enables drag-to-resize functionality when preview mode is enabled
3. **handleEditorDidMount**: Sets up the editor instance and initializes features
4. **updateEditorHeight**: Dynamically adjusts editor height based on content when auto-height is enabled
5. **handleCopy**: Provides clipboard functionality with visual confirmation

## Accessibility Features

The CodeEditor component includes several accessibility enhancements:

- Appropriate ARIA attributes on interactive elements
- Role designations for major component sections
- Focus management
- Keyboard navigation support
- Screen reader announcements for state changes
- High contrast theme options

## Dependencies

This component depends on:

- React (with hooks)
- Monaco Editor (@monaco-editor/react)
- Lucide React icons
- Resizable components (from your UI library)
- Toggle components (from your UI library)
- Select components (custom implementation)
- Spinner component

## Browser Support

The CodeEditor component supports all modern browsers. The clipboard functionality uses the modern Navigator Clipboard API, which may require secure contexts (HTTPS) in some browsers.

## Best Practices

- Set appropriate `minHeight` and `maxHeight` when using `enable_auto_height` to prevent layout shifts
- For read-only code displays, set `readOnly={true}` and disable editor tools for a cleaner interface
- Use the `hasError` prop in conjunction with form validation to provide visual feedback
- Consider performance implications when working with very large code files
- Use the language prop to ensure proper syntax highlighting for your code content