import { Dimensions, PixelRatio } from 'react-native';

export const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base de diseño de referencia (iPhone SE: 375 x 667 dp lógicos)
const GUIDELINE_BASE_WIDTH = 375;
const GUIDELINE_BASE_HEIGHT = 667;

/**
 * Escala un tamaño en base al ancho de la pantalla actual.
 * Ideal para: anchos de elementos, márgenes y paddings horizontales.
 */
export const scale = (size: number): number => {
  return (screenWidth / GUIDELINE_BASE_WIDTH) * size;
};

/**
 * Escala un tamaño en base al alto de la pantalla actual.
 * Ideal para: alturas de elementos, márgenes y paddings verticales.
 */
export const verticalScale = (size: number): number => {
  return (screenHeight / GUIDELINE_BASE_HEIGHT) * size;
};

/**
 * Escala un tamaño de forma moderada utilizando un factor.
 * Ideal para: tamaños de letra (fontSize) y bordes redondeados.
 * Evita que el texto escale de forma desproporcionada en dispositivos grandes.
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * Determina si el dispositivo actual es una Tablet.
 */
export const isTablet = (): boolean => {
  const pixelDensity = PixelRatio.get();
  if (pixelDensity < 2 && (screenWidth >= 1000 || screenHeight >= 1000)) {
    return true;
  }
  return pixelDensity >= 2 && (screenWidth >= 768 || screenHeight >= 768);
};
