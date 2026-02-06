import React, { createContext, useContext, useState, useEffect } from 'react';

const themes = {
  blue: {
    name: 'Azul',
    primary: 'from-blue-600 to-blue-700',
    secondary: 'from-blue-50 to-indigo-50',
    accent: 'blue',
    button: 'bg-blue-600 hover:bg-blue-700',
    buttonSecondary: 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  },
  green: {
    name: 'Verde',
    primary: 'from-emerald-600 to-green-700',
    secondary: 'from-emerald-50 to-green-50',
    accent: 'emerald',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    buttonSecondary: 'bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50'
  },
  purple: {
    name: 'Roxo',
    primary: 'from-purple-600 to-purple-700',
    secondary: 'from-purple-50 to-purple-50',
    accent: 'purple',
    button: 'bg-purple-600 hover:bg-purple-700',
    buttonSecondary: 'bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
  },
  red: {
    name: 'Vermelho',
    primary: 'from-red-600 to-red-700',
    secondary: 'from-red-50 to-red-50',
    accent: 'red',
    button: 'bg-red-600 hover:bg-red-700',
    buttonSecondary: 'bg-white border-2 border-red-600 text-red-600 hover:bg-red-50'
  },
  orange: {
    name: 'Laranja',
    primary: 'from-orange-600 to-orange-700',
    secondary: 'from-orange-50 to-orange-50',
    accent: 'orange',
    button: 'bg-orange-600 hover:bg-orange-700',
    buttonSecondary: 'bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50'
  }
};

const ThemeContext = createContext({});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('blue');

  useEffect(() => {
    // Carregar tema do localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const changeTheme = (themeKey) => {
    if (themes[themeKey]) {
      setCurrentTheme(themeKey);
      localStorage.setItem('theme', themeKey);
    }
  };

  const theme = themes[currentTheme];

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};










