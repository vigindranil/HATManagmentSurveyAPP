import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    isDarkMode: boolean;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [theme, setThemeState] = useState<Theme>(systemColorScheme || 'light');

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('user-theme');
                if (savedTheme === 'light' || savedTheme === 'dark') {
                    setThemeState(savedTheme);
                }
            } catch (error) {
                console.error('Error loading theme:', error);
            }
        };
        loadTheme();
    }, []);

    const setTheme = async (newTheme: Theme) => {
        setThemeState(newTheme);
        try {
            await AsyncStorage.setItem('user-theme', newTheme);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    const isDarkMode = theme === 'dark';

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const Colors = {
    light: {
        background: '#f8fafc',
        card: '#ffffff',
        text: '#1e293b',
        subtext: '#64748b',
        primary: '#2563EB',
        border: '#e5e7eb',
        header: '#ffffff',
        disabled: '#cbd5e1', // Slightly darker gray for better visibility in light mode
    },
    dark: {
        background: '#0f172a',
        card: '#1e293b',
        text: '#f8fafc',
        subtext: '#94a3b8',
        primary: '#3b82f6',
        border: '#334155',
        header: '#1e293b',
        disabled: '#0f172a', // Matches background for a deep "sunken" look
    },
};
