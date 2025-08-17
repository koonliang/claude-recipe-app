export const colors = {
  // Orange theme for dark mode
  primary: '#FF6B35',
  primaryDark: '#E55A2B',
  secondary: '#FF8F65', 
  accent: '#FFB399',
  
  // Dark mode backgrounds
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2D2D2D',
  
  // Dark mode text
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textDisabled: '#666666',
  
  // UI elements
  border: '#404040',
  borderLight: '#333333',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Basic colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Input specific
  inputBackground: '#2D2D2D',
  inputBorder: '#404040',
  inputBorderFocus: '#FF6B35',
  inputText: '#FFFFFF',
  placeholder: '#888888',
} as const;

export const typography = {
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;