import { m3 } from "./src/theme/m3-role-map.ts";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        // default (for reference): sm: "40rem", md: "48rem", lg: "64rem", xl: "80rem", "2xl": "96rem"
        hd:  "100rem",  // 1600px
        fhd: "120rem",  // 1920px
        qhd: "160rem",  // 2560px
        uhd: "240rem"   // 3840px
      },
      colors: {
        // now you can do className="bg-m3-primary text-m3-onPrimary"
        m3: m3.color
      },
      boxShadow: {
        m3_1: m3.elevation.level1.shadow,
        m3_2: m3.elevation.level2.shadow,
        m3_3: m3.elevation.level3.shadow
      },
      borderColor: {
        m3_outline: m3.color.outline
      },
      spacing: {
        // Progressive padding for full-width layouts
        'fluid-sm': 'clamp(1rem, 2.5vw, 2rem)',
        'fluid-md': 'clamp(1.5rem, 3.5vw, 3rem)',
        'fluid-lg': 'clamp(2rem, 4.5vw, 4rem)',
        'fluid-xl': 'clamp(3rem, 6vw, 6rem)',
        'fluid-2xl': 'clamp(4rem, 8vw, 8rem)'
      }
    },
  },
  plugins: [],
};
