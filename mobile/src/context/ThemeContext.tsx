import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  theme: typeof darkTheme;
}

export const darkTheme = {
  background: '#0a0a0a',
  surface: '#1a1a1a',
  surfaceSecondary: '#222',
  text: '#ffffff',
  textSecondary: '#888',
  textTertiary: '#555',
  border: '#333',
  accent: '#C9A84C',
  accentLight: '#1a1600',
  card: '#1a1a1a',
  input: '#1a1a1a',
  tabBar: '#0a0a0a',
  tabBarBorder: '#222',
};

export const lightTheme = {
  background: '#FAFAF8',
  surface: '#ffffff',
  surfaceSecondary: '#F0EDE8',
  text: '#1A1A1A',
  textSecondary: '#666',
  textTertiary: '#999',
  border: '#F0EDE8',
  accent: '#C9884C',
  accentLight: '#FFF8F3',
  card: '#ffffff',
  input: '#F0EDE8',
  tabBar: '#ffffff',
  tabBarBorder: '#F0EDE8',
};

const THEME_KEY = 'stylebook_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Light mode is the default
  const [isDark, setIsDark] = useState(false);

  // Load saved preference on startup (stays light if nothing saved)
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{
      isDark,
      toggleTheme,
      theme: isDark ? darkTheme : lightTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};