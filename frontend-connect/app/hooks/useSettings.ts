'use client'

import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';
export type Locale = 'en-US' | 'fr-FR' | 'en-GB' | 'zh-Hant-HK';
export type Overlay = 'dialog' | 'drawer';

interface Settings {
  theme: Theme;
  locale: Locale;
  primaryColor: string;
  overlay: Overlay;
}

const defaultSettings: Settings = {
  theme: 'light',
  locale: 'en-US',
  primaryColor: '#625afa',
  overlay: 'dialog',
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    try {
      const stored = localStorage.getItem('furever_settings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      localStorage.setItem('furever_settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    try {
      localStorage.removeItem('furever_settings');
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  return {
    ...settings,
    isLoaded,
    updateSettings,
    resetSettings,
    setTheme: (theme: Theme) => updateSettings({ theme }),
    setLocale: (locale: Locale) => updateSettings({ locale }),
    setPrimaryColor: (primaryColor: string) => updateSettings({ primaryColor }),
    setOverlay: (overlay: Overlay) => updateSettings({ overlay }),
  };
}