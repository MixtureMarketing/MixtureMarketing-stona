/**
 * Szerokości wariantów obrazów z public/assets/images (generuje je
 * scripts/convert-images.js jako <nazwa>-<w>.avif / .webp). Lista MUSI być zgodna
 * z RESPONSIVE_WIDTHS w skrypcie — pilnuje tego tests/responsiveImages.test.ts.
 */
export const RESPONSIVE_WIDTHS = [480, 960, 1600] as const;
