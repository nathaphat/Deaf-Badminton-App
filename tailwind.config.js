import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                sans: ['"Noto Sans Thai"', 'ui-sans-serif', 'system-ui'],
            },
        },
    },

    plugins: [forms],

    darkMode: "class",
    safelist: [
        // Machine status dark BG
        'dark:bg-green-800',
        'dark:bg-yellow-800',
        'dark:bg-gray-800',
        'dark:bg-red-800',
        'dark:bg-slate-800',

        // Light BG (บางกรณี purge ลบ)
        'bg-green-300',
        'bg-yellow-300',
        'bg-gray-300',
        'bg-red-300',
        'bg-slate-200',

        'dark:bg-gradient-to-r',
        'dark:from-slate-700',
        'dark:to-slate-900',
    ],
};
