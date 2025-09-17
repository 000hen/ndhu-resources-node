import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Share Tech Mono", "Noto Sans TC", "sans-serif"]
      }
    },
  },
} satisfies Config;
