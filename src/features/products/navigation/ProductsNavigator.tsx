import React from 'react';
import { ProductsScreen } from '../screens/ProductsScreen';

interface ProductsNavigatorProps {
  onNavigateToPayment: () => void;
}

/**
 * Navegador/Router modular del módulo de Productos.
 * Al estar autocontenido, encapsula las rutas internas del catálogo.
 */
export const ProductsNavigator: React.FC<ProductsNavigatorProps> = ({ onNavigateToPayment }) => {
  // Gestiona la vista de catálogo principal y propaga la navegación de Checkout
  return <ProductsScreen onNavigateToPayment={onNavigateToPayment} />;
};

export default ProductsNavigator;
