import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                manrope: ['Manrope', 'sans-serif'],
            },
            colors: {
                primary: '#000666',
                secondary: '#006875',
                background: '#f7f9fc',
                'surface-container-low': '#f2f4f7',
                'surface-container-high': '#e6e8eb',
                'surface-container-highest': '#e0e3e6',
                'surface-container-lowest': '#ffffff',
                'secondary-container': '#00e3fd',
                'on-secondary-container': '#00616d',
                'on-surface-variant': '#454652',
                outline: '#767683',
                'outline-variant': '#c6c5d4',
            },
        },
    },

    plugins: [forms],
};
