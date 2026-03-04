export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#00a3ff',
        success: '#34d399',
        danger: '#ff4d4d',
        warning: '#fbbf24',
        surface: {
          DEFAULT: 'rgba(14, 21, 27, 0.9)',
          light: 'rgba(25, 63, 85, 0.35)',
          border: 'rgba(255, 255, 255, 0.1)',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        highlight: {
          '0%, 100%': { opacity: '0.18' },
          '50%': { opacity: '0.15' },
        },
        notice: {
          '0%': { transform: 'scale(1)', opacity: '0.8', letterSpacing: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0', letterSpacing: '4px' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out forwards',
        highlight: 'highlight 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        notice: 'notice 1.5s ease-out',
      },
    },
  },
  plugins: [],
};
