export const baseStyles =
  'inline-flex items-center justify-center font-bold rounded-full transition-all duration-300 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#213261] focus:ring-offset-[#F5F7FA]';

export const sizeStyles = {
  sm: 'px-6 py-3 text-sm',
  md: 'px-8 py-3 text-base',
  lg: 'px-10 py-4 text-lg',
};

export const variantStyles = {
  primary: `bg-gradient-to-br from-secondary to-[#5A58AD] text-white shadow-lg hover:shadow-[0_8px_25px_-5px_rgba(97,182,222,0.6)] motion-safe:hover:-translate-y-1 border border-transparent`,
  secondary: `bg-transparent border-2 border-secondary text-secondary hover:bg-secondary hover:text-white hover:shadow-lg motion-safe:hover:-translate-y-1`,
  outline: `border-2 border-secondary text-secondary hover:bg-secondary hover:text-white`,
  ghost: `text-secondary hover:text-accent-dark hover:bg-secondary/5`,
  white:
    'bg-white text-secondary hover:bg-gray-50 shadow-lg hover:shadow-xl motion-safe:hover:-translate-y-1',
};
