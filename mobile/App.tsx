import 'react-native-gesture-handler';
import React from 'react';
import { LogBox } from 'react-native';

// Hide dev-only warnings (Expo Go limitations; not present in real builds)
LogBox.ignoreLogs([
  /expo-notifications/,
  /SafeAreaView has been deprecated/,
  /ImagePicker.MediaTypeOptions/,
]);
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

function AppContent() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}