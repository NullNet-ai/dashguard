'use client';

import * as React from 'react';
import DropdownCustom, { type DropdownItem } from '~/components/ui/dropdown-custom';

/**
 * DropdownCustom Component Demo Page
 * 
 * This page demonstrates all available props and their usage patterns for the DropdownCustom component.
 * 
 * Available Props:
 * - data: DropdownItem[] - Array of dropdown items with id and name
 * - selectedIndex: number | null - Currently selected item index
 * - onSelectionChange: (index: number | null) => void - Selection change handler
 * - onItemUpdate: (index: number, newName: string) => void - Item update handler
 * - onItemDelete?: (index: number) => void - Optional item delete handler
 * - placeholder?: string - Placeholder text (default: "Create option...")
 * - label?: string - Label text above dropdown
 * - className?: string - Custom CSS classes
 * - variant?: 'border' | 'underline' | 'none' - Visual style variant (default: 'border')
 * - optionClassName?: string - Custom CSS classes for dropdown options
 * - isSearchable?: boolean - Enable search functionality (default: false)
 * - highlightSelection?: boolean - Highlight selected option (default: true)
 * - renderOption?: (item: DropdownItem, isSelected: boolean) => React.ReactNode - Custom option renderer
 * - maxVisibleItems?: number - Maximum visible items in dropdown (default: 5)
 * - renameValidationMessage?: string - Custom validation message (default: "Name cannot be empty")
 * - maxRenameLength?: number - Maximum character length for renaming (default: 50)
 * 
 * Features Demonstrated:
 * 1. Basic dropdown with border variant
 * 2. Borderless dropdown with search
 * 3. Underline variant with custom styling
 * 4. Custom option rendering
 * 5. Different validation settings
 * 6. Item manipulation (add, edit, delete)
 */
export default function Page() {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const [selectedIndex2, setSelectedIndex2] = React.useState<number | null>(null);
  const [selectedCustomIndex, setSelectedCustomIndex] = React.useState<number | null>(null);

  // Mock address data for autocomplete
  const [mockdata, setMockdata] = React.useState<DropdownItem[]>([
    {
      id: 1,
      name: 'Option 1',
    },
    {
      id: 2,
      name: 'Option 2',
    },
    {
      id: 3,
      name: 'Option 3',
    },
    {
      id: 4,
      name: 'Option 4',
    },
    {
      id: 5,
      name: 'Option 5',
    },
  ]);

  const [mockdata2, setMockdata2] = React.useState<DropdownItem[]>([
    {
      id: 1,
      name: 'Workspace 1',
    },
    {
      id: 2,
      name: 'Workspace 2',
    },
    {
      id: 3,
      name: 'Workspace 3',
    },
    {
      id: 4,
      name: 'Workspace 4',
    },
    {
      id: 5,
      name: 'Workspace 5',
    },
  ]);

  // Mock data for workspace with active status
  const [workspaceData, setWorkspaceData] = React.useState<DropdownItem[]>([
    {
      id: 1,
      name: 'Workspace test',
    },
    {
      id: 2,
      name: 'Workspace 2',
    },
    {
      id: 3,
      name: 'Workspace 3',
    },
    {
      id: 4,
      name: 'Workspace 4',
    },
    {
      id: 5,
      name: 'Workspace 5',
    },
    {
      id: 6,
      name: 'Workspace 6',
    },
    {
      id: 7,
      name: 'Workspace 7',
    },
    {
      id: 8,
      name: 'Workspace 8',
    },
    {
      id: 9,
      name: 'Workspace 9',
    },
  ]);

  const [selectedWorkspace, setSelectedWorkspace] = React.useState<number | null>(3); // Workspace 4 is active

  const handleItemUpdate = React.useCallback((index: number, newName: string) => {
    setMockdata((prevMockdata) =>
      prevMockdata.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            name: newName,
          };
        }
        return item;
      })
    );
  }, []);

  const handleItemUpdate2 = React.useCallback((index: number, newName: string) => {
    setMockdata2((prevMockdata) =>
      prevMockdata.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            name: newName,
          };
        }
        return item;
      })
    );
  }, []);

  const handleItemDelete = React.useCallback((index: number) => {
    setMockdata((prevMockdata) => prevMockdata.filter((_, i) => i !== index));
  }, []);

  const handleItemDelete2 = React.useCallback((index: number) => {
    setMockdata2((prevMockdata) => prevMockdata.filter((_, i) => i !== index));
  }, []);

  const handleWorkspaceUpdate = React.useCallback((index: number, newName: string) => {
    setWorkspaceData((prevData) =>
      prevData.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            name: newName,
          };
        }
        return item;
      })
    );
  }, []);

  const handleWorkspaceDelete = React.useCallback((index: number) => {
    setWorkspaceData((prevData) => prevData.filter((_, i) => i !== index));
    // Reset selected workspace if the deleted one was selected
    if (selectedWorkspace === index) {
      setSelectedWorkspace(null);
    } else if (selectedWorkspace !== null && selectedWorkspace > index) {
      setSelectedWorkspace(selectedWorkspace - 1);
    }
  }, [selectedWorkspace]);

  // Custom option renderer example
  const customOptionRenderer = React.useCallback((item: DropdownItem, isSelected: boolean) => (
    <div className="flex items-center justify-between w-full px-3">
      <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
        {item.name}
      </span>
      <span className={`text-xs ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
        ID: {item.id}
      </span>
    </div>
  ), []);

  // Workspace option renderer with active status
  const workspaceOptionRenderer = React.useCallback((item: DropdownItem, isSelected: boolean) => {
    const isActive = selectedWorkspace === item.id - 1; // Check if this workspace is active
    
    return (
      <div className="flex items-center justify-between w-full px-3">
        <span className={`text-md text-gray-700 `}>
          {item.name}
        </span>
        {isActive && (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full ">
            Active
          </span>
        )}
      </div>
    );
  }, [selectedWorkspace]);

  return (
    <div className='px-6 py-8 space-y-8'>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DropdownCustom Component Demo</h1>
        <p className="text-gray-600">Comprehensive demonstration of all available props and features</p>
      </div>

      {/* Basic Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Basic Variants</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Borderless Dropdown with Search */}
          <DropdownCustom
            data={mockdata}
            selectedIndex={selectedIndex}
            onSelectionChange={setSelectedIndex}
            onItemUpdate={handleItemUpdate}
            onItemDelete={handleItemDelete}
            label="Borderless Dropdown"
            placeholder="Option Name"
            className='w-full'
            variant='none'
            isSearchable={true}
            highlightSelection
            maxRenameLength={10}
            maxVisibleItems={3}
            renameValidationMessage="Option name is required"
            
          />
          
          {/* Bordered Dropdown */}
          <DropdownCustom
            data={mockdata2}
            selectedIndex={selectedIndex2}
            onSelectionChange={setSelectedIndex2}
            onItemUpdate={handleItemUpdate2}
            onItemDelete={handleItemDelete2}
            label="Bordered Dropdown"
            placeholder="Option Name"
            className='w-full'
            variant='border'
            isSearchable={true}
            highlightSelection
            maxRenameLength={15}
            maxVisibleItems={4}
          />
          
          {/* Underline Dropdown */}
          <DropdownCustom
            data={mockdata}
            selectedIndex={selectedIndex}
            onSelectionChange={setSelectedIndex}
            onItemUpdate={handleItemUpdate}
            onItemDelete={handleItemDelete}
            label="Underline Dropdown"
            placeholder="Select option..."
            className='w-full'
            variant='underline'
            isSearchable={true}
            highlightSelection
            maxRenameLength={20}
            maxVisibleItems={5}
          />
          
  
        </div>
      </section>

      {/* Advanced Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Advanced Features</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Custom Option Renderer */}
          <DropdownCustom
            data={mockdata2}
            selectedIndex={selectedCustomIndex}
            onSelectionChange={setSelectedCustomIndex}
            onItemUpdate={handleItemUpdate2}
            onItemDelete={handleItemDelete2}
            label="Custom Option Renderer"
            placeholder="Custom styled options"
            className='w-full'
            variant='border'
            optionClassName='min-w-[280px]'
            isSearchable={true}
            highlightSelection
            renderOption={customOptionRenderer}
            maxVisibleItems={3}
          />
          
          {/* Workspace Selector with Active Status */}
          <DropdownCustom
            data={workspaceData}
            selectedIndex={selectedWorkspace}
            onSelectionChange={setSelectedWorkspace}
            onItemUpdate={handleWorkspaceUpdate}
            onItemDelete={handleWorkspaceDelete}
            label="Workspace Selector with Active Status"
            placeholder="Select workspace"
            className='w-full'
            variant='border'
            optionClassName='min-w-[280px]'
            isSearchable={true}
            highlightSelection={false}
            renderOption={workspaceOptionRenderer}
            maxVisibleItems={6}
            maxRenameLength={30}
            renameValidationMessage="Workspace name is required"
            itemClassName='hover:bg-slate-100 hover:text-slate-900'
            
          />
        </div>
      </section>

      {/* Prop Manipulation Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Prop Manipulation Examples</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Key Props Demonstrated:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li><code className="bg-white px-1 rounded">variant</code>: 'border', 'underline', 'none' - Controls visual style</li>
            <li><code className="bg-white px-1 rounded">isSearchable</code>: true/false - Enables search functionality</li>
            <li><code className="bg-white px-1 rounded">highlightSelection</code>: true/false - Highlights selected option</li>
            <li><code className="bg-white px-1 rounded">maxVisibleItems</code>: number - Controls dropdown height</li>
            <li><code className="bg-white px-1 rounded">maxRenameLength</code>: number - Limits character input</li>
            <li><code className="bg-white px-1 rounded">renderOption</code>: function - Custom option rendering</li>
            <li><code className="bg-white px-1 rounded">onItemDelete</code>: optional - Enables/disables delete functionality</li>
            <li><code className="bg-white px-1 rounded">optionClassName</code>: string - Custom styling for dropdown options</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
