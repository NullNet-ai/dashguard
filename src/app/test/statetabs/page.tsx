"use client";

import { useState } from "react";
import StateTab from "~/components/platform/StateTab";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { UserIcon, SettingsIcon, BellIcon, HomeIcon, ArrowLeftRight, RotateCw } from "lucide-react";

export default function StateTabsExample() {
  const [count, setCount] = useState(0);
  const [tabPosition, setTabPosition] = useState<"left" | "right">("left");
  const [rotateText, setRotateText] = useState(true);

  const togglePosition = () => {
    setTabPosition(tabPosition === "left" ? "right" : "left");
  };

  const toggleRotateText = () => {
    setRotateText(!rotateText);
  };

  return (
    <div className=" overflow-auto h-screen p-12">
      <h1 className="text-2xl font-bold mb-6">StateTab Vertical Orientation Example</h1>
      <div className="flex justify-end mb-4 gap-2">
        <Button
          onClick={toggleRotateText}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCw className="h-4 w-4" />
          {rotateText ? "Disable" : "Enable"} Rotated Text
        </Button>
        <Button
          onClick={togglePosition}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Toggle Position: {tabPosition === "left" ? "Left" : "Right"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Vertical Orientation Example */}
        <Card>
          <CardHeader>
            <CardTitle>Vertical Tabs</CardTitle>
            <CardDescription>
              Example of StateTab component with vertical orientation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StateTab
              orientation="vertical"
              variant="default"
              persistKey="vertical-tabs-example"
              position={tabPosition}
              rotateText={rotateText}
              tabs={[
                {
                  id: "profile",
                  label: "Profile",
                  icon: <UserIcon className="h-4 w-4 mr-2" />,
                  content: (
                    <div className="p-4 border rounded-md">
                      <h3 className="text-lg font-medium mb-2">Profile Content</h3>
                      <p className="text-gray-600 mb-4">
                        This is the profile tab content. The tabs are displayed vertically
                        on the {tabPosition} side.
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setCount(count + 1)}
                          variant="outline"
                        >
                          Increment
                        </Button>
                        <span>Count: {count}</span>
                      </div>
                    </div>
                  ),
                },
                {
                  id: "settings",
                  label: "Settings",
                  icon: <SettingsIcon className="h-4 w-4 mr-2" />,
                  content: (
                    <div className="p-4 border rounded-md">
                      <h3 className="text-lg font-medium mb-2">Settings Content</h3>
                      <p className="text-gray-600">
                        This tab contains settings options. Notice how the state is preserved
                        when switching between tabs.
                      </p>
                    </div>
                  ),
                },
                {
                  id: "notifications",
                  label: "Notifications",
                  icon: <BellIcon className="h-4 w-4 mr-2" />,
                  content: (
                    <div className="p-4 border rounded-md">
                      <h3 className="text-lg font-medium mb-2">Notifications Content</h3>
                      <p className="text-gray-600">
                        This tab shows notifications. The vertical orientation works well
                        for more complex tab interfaces.
                      </p>
                    </div>
                  ),
                },
                {
                  id: "dashboard",
                  label: "Dashboard",
                  icon: <HomeIcon className="h-4 w-4 mr-2" />,
                  content: (
                    <div className="p-4 border rounded-md">
                      <h3 className="text-lg font-medium mb-2">Dashboard Content</h3>
                      <p className="text-gray-600">
                        This is the dashboard tab. Vertical tabs are great for admin interfaces
                        or when you have many tabs to display.
                      </p>
                    </div>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Different Variants Example */}
        <Card>
          <CardHeader>
            <CardTitle>Vertical Tabs - Different Variants</CardTitle>
            <CardDescription>
              Examples of different variants with vertical orientation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pills Variant */}
              <div>
                <h3 className="text-md font-medium mb-3">Pills Variant</h3>
                <StateTab
                  rotateText={rotateText}
                  orientation="vertical"
                  variant="pills"
                  persistKey="vertical-pills-example"
                  position={tabPosition}
                  tabs={[
                    {
                      id: "tab1",
                      label: "Tab 1",
                      content: <div className="p-3">Pills variant content 1</div>,
                    },
                    {
                      id: "tab2",
                      label: "Tab 2",
                      content: <div className="p-3">Pills variant content 2</div>,
                    },
                    {
                      id: "tab3",
                      label: "Tab 3",
                      content: <div className="p-3">Pills variant content 3</div>,
                    },
                  ]}
                />
              </div>

              {/* Underline Variant */}
              <div>
                <h3 className="text-md font-medium mb-3">Underline Variant</h3>
                <StateTab
                  rotateText={rotateText}
                  orientation="vertical"
                  variant="underline"
                  persistKey="vertical-underline-example"
                  position={tabPosition}
                  tabs={[
                    {
                      id: "tab1",
                      label: "Tab 1",
                      content: <div className="p-3">Underline variant content 1</div>,
                    },
                    {
                      id: "tab2",
                      label: "Tab 2",
                      content: <div className="p-3">Underline variant content 2</div>,
                    },
                    {
                      id: "tab3",
                      label: "Tab 3",
                      content: <div className="p-3">Underline variant content 3</div>,
                    },
                  ]}
                />
              </div>

              {/* Shadow Variant */}
              <div>
                <h3 className="text-md font-medium mb-3">Shadow Variant</h3>
                <StateTab
                  orientation="vertical"
                  rotateText={rotateText}
                  variant="shadow"
                  persistKey="vertical-shadow-example"
                  position={tabPosition}
                  tabs={[
                    {
                      id: "tab1",
                      label: "Tab 1",
                      content: <div className="p-3">Shadow variant content 1</div>,
                    },
                    {
                      id: "tab2",
                      label: "Tab 2",
                      content: <div className="p-3">Shadow variant content 2</div>,
                    },
                    {
                      id: "tab3",
                      label: "Tab 3",
                      content: <div className="p-3">Shadow variant content 3</div>,
                    },
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}