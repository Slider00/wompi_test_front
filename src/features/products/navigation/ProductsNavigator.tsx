import React from 'react';
import { ProductsScreen } from '../screens/ProductsScreen';

/**
 * Navegador/Router modular del módulo de Productos.
 * Al estar autocontenido, encapsula las rutas internas del catálogo.
 */
export const ProductsNavigator: React.FC = () => {
  // Por ahora sólo gestiona la vista de catálogo principal
  return <ProductsScreen />;
};

export default ProductsNavigator;
