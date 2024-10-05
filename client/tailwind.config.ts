import {nextui} from '@nextui-org/theme';
import type {Config} from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    darkMode: "class",
    plugins: [nextui({
        themes: {
            dark: {
                extend: "dark", // <- inherit default values from dark theme
                colors: {
                    background: "#0D001A",
                    foreground: "#ffffff",
                    primary: {
                        50: "#2e2e65",
                        100: "#37377a",
                        200: "#40408f",
                        300: "#4949a4",
                        400: "#5252b9",
                        500: "#4a4a98", // <- Base color
                        600: "#5e5ea8",
                        700: "#7373b8",
                        800: "#8888c8",
                        900: "#9d9dd8",
                        DEFAULT: "#4a4a98", // <- Default primary color
                        foreground: "#ffffff",
                    },
                    focus: "#5e5ea8", // <- Slightly lighter shade for focus
                },
                layout: {
                    disabledOpacity: "0.3",
                    radius: {
                        small: "4px",
                        medium: "6px",
                        large: "8px",
                    },
                    borderWidth: {
                        small: "1px",
                        medium: "2px",
                        large: "3px",
                    },
                },
            },
            "blue-palette": {
                extend: "dark", // <- inherit default values from dark theme
                colors: {
                    background: "#0f0d33",
                    foreground: "#ffffff",
                    primary: {
                        50: "#2e2e65",
                        100: "#37377a",
                        200: "#40408f",
                        300: "#4949a4",
                        400: "#5252b9",
                        500: "#4a4a98", // <- Base color
                        600: "#5e5ea8",
                        700: "#7373b8",
                        800: "#8888c8",
                        900: "#9d9dd8",
                        DEFAULT: "#4a4a98", // <- Default primary color
                        foreground: "#ffffff",
                    },
                    focus: "#5e5ea8", // <- Slightly lighter shade for focus
                },
                layout: {
                    disabledOpacity: "0.3",
                    radius: {
                        small: "4px",
                        medium: "6px",
                        large: "8px",
                    },
                    borderWidth: {
                        small: "1px",
                        medium: "2px",
                        large: "3px",
                    },
                },
            }
        }
    })],
};
export default config;
