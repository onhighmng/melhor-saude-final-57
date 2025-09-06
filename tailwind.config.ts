
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Baskervville", "serif"],
        body: ["Baskervville", "serif"],
        heading: ["Noto Serif", "serif"],
        display: ["Noto Serif", "serif"],
        accent: ["Comfortaa", "sans-serif"], // Using Comfortaa as Maname Colombo alternative
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom colors
        "royal-blue": "hsl(var(--royal-blue))",
        "sky-blue": "hsl(var(--sky-blue))",
        "navy-blue": "hsl(var(--navy-blue))",
        "mint-green": "hsl(var(--mint-green))",
        "peach-orange": "hsl(var(--peach-orange))",
        "soft-white": "hsl(var(--soft-white))",
        "cool-grey": "hsl(var(--cool-grey))",
        "vibrant-blue": "hsl(var(--vibrant-blue))",
        "emerald-green": "hsl(var(--emerald-green))",
        "deep-navy": "hsl(var(--deep-navy))",
        "bright-royal": "hsl(var(--bright-royal))",
        "warm-orange": "hsl(var(--warm-orange))",
        "slate-grey": "hsl(var(--slate-grey))",
        "accent-sage": "hsl(var(--accent-sage))",
        "accent-sky": "hsl(var(--accent-sky))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "stackMotion": {
          "0%, 100%": {
            transform: "rotateY(0deg)",
          },
          "50%": {
            transform: "rotateY(15deg)",
          },
        },
        "cardStack": {
          "0%, 100%": {
            transform: "translateY(0px) scale(1)",
          },
          "25%": {
            transform: "translateY(-4px) scale(1.02)",
          },
          "75%": {
            transform: "translateY(2px) scale(0.98)",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "fade-out": {
          "0%": {
            opacity: "1",
            transform: "translateY(0)"
          },
          "100%": {
            opacity: "0",
            transform: "translateY(10px)"
          }
        },
        "slide-in-right": {
          "0%": { 
            opacity: "0",
            transform: "translateX(100%)" 
          },
          "100%": { 
            opacity: "1",
            transform: "translateX(0)" 
          }
        },
        "slide-in-left": {
          "0%": { 
            opacity: "0",
            transform: "translateX(-100%)" 
          },
          "100%": { 
            opacity: "1",
            transform: "translateX(0)" 
          }
        },
        "scale-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.95)"
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)"
          }
        },
        "bounce-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.3)"
          },
          "50%": {
            opacity: "1",
            transform: "scale(1.05)"
          },
          "70%": {
            transform: "scale(0.9)"
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)"
          }
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1)"
          },
          "50%": {
            opacity: "0.8",
            transform: "scale(1.02)"
          }
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0px)"
          },
          "50%": {
            transform: "translateY(-6px)"
          }
        },
        "subtleFloat": {
          "0%, 100%": { 
            transform: "translateY(0px) scale(1)" 
          },
          "50%": { 
            transform: "translateY(-8px) scale(1.01)" 
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.3s ease-out",
        "accordion-up": "accordion-up 0.3s ease-out",
        "stackMotion": "stackMotion 6s ease-in-out infinite",
        "cardStack": "cardStack 3s ease-in-out infinite",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "fade-out": "fade-out 0.4s ease-out forwards",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "slide-in-left": "slide-in-left 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "bounce-in": "bounce-in 0.6s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "subtleFloat": "subtleFloat 6s ease-in-out infinite"
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
