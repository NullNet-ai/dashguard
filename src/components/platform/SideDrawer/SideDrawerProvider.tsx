/* eslint-disable @typescript-eslint/no-require-imports */
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

import {
  type IActions,
  type ISideDrawerConfig,
  type ISideDrawerContextProps,
} from './types'

const SideDrawerContext = createContext<ISideDrawerContextProps | undefined>(undefined)

// Storage keys
export const DRAWER_WIDTH_KEY = 'sideDrawer_width'
export const PINNED_STATE_KEY = 'sideDrawer_isPinned'
const CONFIG_KEY = 'sideDrawer_config'
const OPEN_STATE_KEY = 'sideDrawer_isOpen'
const DRAWER_TYPE_KEY = 'sideDrawer_type'
const DRAWER_PROPS_KEY = 'sideDrawer_props'

export const SideDrawerProvider: React.FC<React.PropsWithChildren<object>> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<ISideDrawerConfig | null>(null)
  const [isPinned, setIsPinned] = useState(false)
  const [drawerType, setDrawerType] = useState<string | null>(null)
  const [, setComponentProps] = useState<Record<string, any> | null>(null)

  useEffect(() => {
    const storedPinnedState = localStorage.getItem(PINNED_STATE_KEY);
    const storedOpenState = localStorage.getItem(OPEN_STATE_KEY);
    const storedConfig = localStorage.getItem(CONFIG_KEY);
    const storedWidth = localStorage.getItem(DRAWER_WIDTH_KEY);
    const storedDrawerType = localStorage.getItem(DRAWER_TYPE_KEY);
    const storedProps = localStorage.getItem(DRAWER_PROPS_KEY);

    if (storedPinnedState === 'true') {
      setIsPinned(true);

      if (storedOpenState === 'true' && storedDrawerType) {
        try {
          let parsedProps = {};
          if (storedProps) {
            try {
              parsedProps = JSON.parse(storedProps);
              setComponentProps(parsedProps);
            } catch (e) {
              console.error('Failed to parse stored component props:', e);
            }
          }

          // Set the drawer type
          setDrawerType(storedDrawerType);

          // Get the component and header based on drawer type
          const component = getComponentByType(storedDrawerType);
          const header = getHeaderByType(storedDrawerType);
          const registeredConfig = getConfigByType(storedDrawerType);

          // Parse the stored config for additional options
          let parsedConfigOptions = {};
          if (storedConfig) {
            try {
              parsedConfigOptions = JSON.parse(storedConfig);
            } catch (e) {
              console.error('Failed to parse stored config:', e);
            }
          }

          // Create a config with the actual component
          const restoredConfig: ISideDrawerConfig = {
            sideDrawerWidth: storedWidth || registeredConfig.sideDrawerWidth || '982px',
            ...registeredConfig,
            ...parsedConfigOptions,
            drawerType: storedDrawerType,
            header,
            body: {
              component: component as React.ComponentType<any>,
              componentProps: parsedProps
            }
          };

          setConfig(restoredConfig);
          setIsOpen(storedOpenState === 'true');
        } catch (e) {
          console.error('Failed to restore SideDrawer:', e);
          // Clear invalid storage data
          clearStorageData();
        }
      }
    }
  }, [])

  const clearStorageData = () => {
    localStorage.removeItem(PINNED_STATE_KEY)
    localStorage.removeItem(OPEN_STATE_KEY)
    localStorage.removeItem(CONFIG_KEY)
    localStorage.removeItem(DRAWER_TYPE_KEY)
    localStorage.removeItem(DRAWER_PROPS_KEY)
  }

  // When saving to localStorage, store only serializable properties
  useEffect(() => {
    if (isPinned) {
      localStorage.setItem(PINNED_STATE_KEY, 'true')
      localStorage.setItem(OPEN_STATE_KEY, isOpen ? 'true' : 'false')

      if (config && drawerType) {
        try {
          // Store the drawer type
          localStorage.setItem(DRAWER_TYPE_KEY, drawerType)

          // Store component props if available
          if (config.body?.componentProps) {
            try {
              localStorage.setItem(DRAWER_PROPS_KEY, JSON.stringify(config.body.componentProps))
            } catch (e) {
              console.error('Failed to stringify component props:', e)
            }
          }

          const serializableConfig = {
            overlayEnabled: config.overlayEnabled,
            closeOnOutsideClick: config.closeOnOutsideClick,
            resizable: config.resizable,
            showResizeHandle: config.showResizeHandle,
            minResizeWidth: config.minResizeWidth,
            maxResizeWidth: config.maxResizeWidth,
            isPinnable: config.isPinnable,
          }

          localStorage.setItem(CONFIG_KEY, JSON.stringify(serializableConfig))
        } catch (e) {
          console.error('Failed to stringify SideDrawer config:', e)
        }
      }
    } else {
      // Clear storage when unpinned
      clearStorageData()
    }
  }, [isPinned, isOpen, config, drawerType])

  const openSideDrawer = (configOrType: ISideDrawerConfig | string) => {
    let config: ISideDrawerConfig;

    // If configOrType is a string, look up the registered drawer
    if (typeof configOrType === 'string') {
      const drawerType = configOrType;
      setDrawerType(drawerType);

      // Get the component and header from registry
      const component = getComponentByType(drawerType);
      const header = getHeaderByType(drawerType);
      const registeredConfig = getConfigByType(drawerType);

      if (!component) {
        console.error(`No drawer component registered for type: ${drawerType}`);
        return;
      }

      // Check for stored width for this drawer type
      const storedWidth = localStorage.getItem(DRAWER_WIDTH_KEY);

      // Create a config from the registered drawer
      config = {
        header,
        body: {
          component: component as React.ComponentType<any> | Promise<() => Element>,
        },
        // Apply registered config options
        ...registeredConfig,
        // Use stored width if available, otherwise use registered width
        sideDrawerWidth: storedWidth || registeredConfig.sideDrawerWidth,
        // Always include the drawer type for persistence
        drawerType
      };
    } else {
      // Use the provided config
      config = configOrType;

      // Store the drawer type if provided
      if (config.drawerType) {
        setDrawerType(config.drawerType);
      } else {
        // Generate a drawer type based on the component name
        const component = config.body?.component;
        let componentName = 'unknown';

        if (component && typeof component !== 'function') {
          componentName = 'async';
        } else if (component && typeof component === 'function') {
          componentName = component.name || 'unknown';
        }

        const generatedType = `drawer_${componentName}_${Date.now()}`;
        setDrawerType(generatedType);
        config.drawerType = generatedType;
      }
    }

    // Store component props
    if (config.body?.componentProps) {
      setComponentProps(config.body.componentProps);
    }

    setConfig(config);
    setIsOpen(true);

    // If pinned, save the config
    if (isPinned) {
      saveCurrentState(config);
    }
  };

  // Helper function to save current state
  const saveCurrentState = (configToSave: ISideDrawerConfig) => {
    if (!drawerType) return;

    try {
      localStorage.setItem(DRAWER_TYPE_KEY, drawerType);

      if (configToSave.sideDrawerWidth) {
        localStorage.setItem(DRAWER_WIDTH_KEY, configToSave.sideDrawerWidth);
      }

      // Update the current config state with the new width
      setConfig(prevConfig => {
        if (!prevConfig) return configToSave;
        return {
          ...prevConfig,
          sideDrawerWidth: configToSave.sideDrawerWidth || prevConfig.sideDrawerWidth
        };
      });

      // Store component props if available
      if (configToSave.body?.componentProps) {
        try {
          localStorage.setItem(DRAWER_PROPS_KEY, JSON.stringify(configToSave.body.componentProps));
        } catch (e) {
          console.error('Failed to stringify component props:', e);
        }
      }

      // Include sideDrawerWidth in the serialized config to ensure it persists
      const serializableConfig = {
        overlayEnabled: configToSave.overlayEnabled,
        closeOnOutsideClick: configToSave.closeOnOutsideClick,
        resizable: configToSave.resizable,
        showResizeHandle: configToSave.showResizeHandle,
        minResizeWidth: configToSave.minResizeWidth,
        maxResizeWidth: configToSave.maxResizeWidth,
        isPinnable: configToSave.isPinnable,
        sideDrawerWidth: configToSave.sideDrawerWidth,
      };

      localStorage.setItem(CONFIG_KEY, JSON.stringify(serializableConfig));
    } catch (e) {
      console.error('Failed to save SideDrawer state:', e);
    }
  };

  const closeSideDrawer = () => {
    // Allow closing even when pinned, but maintain the pinned state
    setIsOpen(false)

    // Call the onCloseSideDrawer callback if provided
    if (config?.onCloseSideDrawer) {
      config.onCloseSideDrawer()
    }

    // If not pinned, also clear the config
    if (!isPinned) {
      setConfig(null)
      // Clear storage when closed and not pinned
      localStorage.removeItem(OPEN_STATE_KEY)
      localStorage.removeItem(CONFIG_KEY)
    } else {
      // If pinned, just update the open state in localStorage
      // but keep the width and other settings
      localStorage.setItem(OPEN_STATE_KEY, 'false')
    }
  }

  // Update the togglePinSideDrawer function to properly capture the current width
  const togglePinSideDrawer = () => {
    const newPinnedState = !isPinned
    setIsPinned(newPinnedState)

    if (newPinnedState) {
      // Save state when pinning
      localStorage.setItem(PINNED_STATE_KEY, 'true')

      if (isOpen && config) {
        // Get the current width from the DOM
        const drawerElement = document.querySelector('[style*="--drawer-width"]')
        let currentWidth = config.sideDrawerWidth || '982px'

        // If we found the drawer element with the custom property, extract its current width
        if (drawerElement) {
          const computedStyle = window.getComputedStyle(drawerElement)
          const customProp = computedStyle.getPropertyValue('--drawer-width').trim()
          if (customProp) {
            currentWidth = customProp
          } else {
            // Fallback: try to get the actual width of the drawer card
            const drawerCard = document.querySelector('[role="dialog"] > div[class*="Card"]')
            if (drawerCard) {
              const rect = drawerCard.getBoundingClientRect()
              currentWidth = `${rect.width}px`
            }
          }
        }

        // Save the current width to localStorage
        localStorage.setItem(DRAWER_WIDTH_KEY, currentWidth)

        // Create a config copy that includes the current width
        const configWithCurrentWidth = {
          ...config,
          sideDrawerWidth: currentWidth
        }

        saveCurrentState(configWithCurrentWidth)
      }
    } else {
      // Clear when unpinning
      clearStorageData()
    }

    // Call the onPinStateChange callback if provided
    if (config?.onPinStateChange) {
      config.onPinStateChange(newPinnedState)
    }
  }

  const actions: IActions = {
    openSideDrawer,
    closeSideDrawer,
    togglePinSideDrawer,
    saveCurrentState, 
  };

  return (
    <SideDrawerContext.Provider value={{
      state: {
        isOpen,
        config,
        isPinned,
      },
      actions,
    }}
    >
      {children}
    </SideDrawerContext.Provider>
  )
}

export function useSideDrawer() {
  const context = useContext(SideDrawerContext)
  if (!context) {
    throw new Error('useSideDrawer must be used within a SideDrawerProvider')
  }
  return context
}

// Create a registry to store drawer configurations
const drawerRegistry = new Map<string, {
  component: React.ComponentType<any>,
  header: React.ReactNode | (() => React.ReactNode),
  config?: Partial<ISideDrawerConfig> // Store additional config options
}>();

export function registerDrawerType(
  drawerType: string,
  config: {
    component: React.ComponentType<any>,
    header: React.ReactNode | (() => React.ReactNode),
    options?: Partial<Omit<ISideDrawerConfig, 'body' | 'header'>> 
  }
) {
  drawerRegistry.set(drawerType, {
    component: config.component,
    header: config.header,
    config: config.options
  });
}

function getComponentByType(drawerType: string) {
  const registeredDrawer = drawerRegistry.get(drawerType);
  if (registeredDrawer) {
    return registeredDrawer.component;
  }

  return (
    <div className="p-4">
      <p>Drawer content could not be loaded.</p>
      <p>Type: {drawerType}</p>
    </div>)
}

function getHeaderByType(drawerType: string) {
  const registeredDrawer = drawerRegistry.get(drawerType);
  if (registeredDrawer) {
    return typeof registeredDrawer.header === 'function'
      ? registeredDrawer.header()
      : registeredDrawer.header;
  }
      return (
        <div className="p-4">
          <p>Drawer header could not be loaded.</p>
          <p>Type: {drawerType}</p>
        </div>
      )
}

function getConfigByType(drawerType: string) {
  const registeredDrawer = drawerRegistry.get(drawerType);
  return registeredDrawer?.config || {};
}
