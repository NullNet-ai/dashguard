import React from 'react'

const Guidelines = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Group Tab Guidelines</h2>
        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Basic Features</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Create multiple tabs to organize your content</li>
              <li>Drag and drop tabs to reorder them</li>
              <li>Each tab can have its own unique content and settings</li>
              <li>Add or remove tabs using the buttons provided</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tab Properties</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Tab Name: Give each tab a unique identifier</li>
              <li>Order: Tabs are automatically ordered based on their position</li>
              <li>Component: Select different components to display in each tab</li>
              <li>Metadata: Store additional data specific to each tab</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tips</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Use meaningful tab names for better organization</li>
              <li>Keep related content grouped in the same tab</li>
              <li>Utilize metadata to store tab-specific configurations</li>
              <li>Save your changes before leaving the form</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Guidelines