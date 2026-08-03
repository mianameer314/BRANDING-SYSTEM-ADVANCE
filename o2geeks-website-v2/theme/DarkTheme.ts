import type { ThemeTypes } from '@/types/theme/ThemeTypes';

const DARK_THEME: ThemeTypes = {
    name: 'DARK_THEME',
    dark: true, 
    variables: {
        'border-color': '#e0e6eb',
        'border-opacity': 0.2,
    },
   
    colors: {
        primary: '#C1FF72',
        secondary: '#1f2a2e',
        muted:'#1f2a2eb3',
        white:'#ffffff',
        lightgray:'#273338',
        dark:'#ffffff',
        surface:'#1F2A2E',
        darkgray:'#273338',
        accent:'#343F42'
    }
};

export { DARK_THEME };
