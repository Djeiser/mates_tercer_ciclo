/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                andalucia: {
                    green: '#009B48',
                    white: '#FFFFFF',
                    gold: '#F4C430', // Approximate gold/yellow
                }
            }
        },
    },
    plugins: [],
}
