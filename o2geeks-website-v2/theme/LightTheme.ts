import type { ThemeTypes } from '@/types/theme/ThemeTypes';

const LIGHT_THEME: ThemeTypes = {
    name: 'LIGHT_THEME',
    dark: false,
    variables: {
        'border-color': '#e0e6eb',
        'border-opacity': 1,
    },
    colors: {
        primary: '#C1FF72',
        secondary: '#1f2a2e',
        muted:'#E0E0E0',
        white:'#ffffff',
        lightgray:'#F4F8FA',
        dark:'#1f2a2e',
        surface:'#F4F8FA',
        accent:'#ffffff'
    }
};

export { LIGHT_THEME };
