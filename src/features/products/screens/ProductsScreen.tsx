import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../../store';
import { setPendingAmount, setCart } from '../../payment/store/paymentSlice';
import { RootContainer } from '../../../components/RootContainer';
import { GLOBAL_STYLES, COLORS, SPACING, FONTS } from '../../../theme/theme';
import { scale } from '../../../utils/responsive';
import { productService, Product, BASE_URL } from '../services/productService';

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Auriculares Bluetooth Pro',
    description: 'Cancelación activa de ruido, batería de 30 horas y sonido premium.',
    price: 249900,
    icon: '🎧',
    stock: 8,
  },
  {
    id: 'prod-2',
    name: 'Reloj Inteligente Fit',
    description: 'Pantalla AMOLED, monitoreo de salud 24/7 y GPS integrado.',
    price: 379900,
    icon: '⌚',
    stock: 5,
  },
  {
    id: 'prod-3',
    name: 'Teclado Mecánico RGB',
    description: 'Switches mecánicos táctiles, retroiluminación RGB y conexión inalámbrica.',
    price: 189900,
    icon: '⌨️',
    stock: 4,
  },
  {
    id: 'prod-4',
    name: 'Cargador Inalámbrico Rápido',
    description: 'Carga magnética de 15W compatible con múltiples dispositivos.',
    price: 89900,
    icon: '⚡',
    stock: 12,
  },
];

interface ProductsScreenProps {
  onNavigateToPayment: () => void;
}

export const ProductsScreen: React.FC<ProductsScreenProps> = ({ onNavigateToPayment }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [productsList, setProductsList] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts();
        if (data && Array.isArray(data)) {
          setProductsList(data);
        }
      } catch (error) {
        console.warn('[ProductsScreen] Error al conectar con backend, usando fallback local:', error);
        setProductsList(FALLBACK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleIncrement = (productId: string) => {
    const product = productsList.find((p) => p.id === productId);
    if (!product) return;

    setQuantities((prev) => {
      const current = prev[productId] || 0;
      if (current >= product.stock) {
        (globalThis as any).alert(`${t('products.max_stock_reached') || 'Stock máximo alcanzado'}: ${product.name}`);
        return prev;
      }
      return {
        ...prev,
        [productId]: current + 1,
      };
    });
  };

  const handleDecrement = (productId: string) => {
    setQuantities((prev) => {
      const current = prev[productId] || 0;
      if (current <= 0) return prev;
      return {
        ...prev,
        [productId]: current - 1,
      };
    });
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalItems = Object.values(quantities).reduce((acc, q) => acc + q, 0);
  const totalPrice = productsList.reduce((acc, p) => acc + (quantities[p.id] || 0) * p.price, 0);

  const handleCheckout = () => {
    if (totalPrice <= 0) return;

    // Mapear cantidades al formato del carrito de Redux
    const cartItems = Object.entries(quantities)
      .map(([productId, quantity]) => ({ productId, quantity }))
      .filter((item) => item.quantity > 0);

    dispatch(setCart(cartItems));
    dispatch(setPendingAmount(totalPrice));
    onNavigateToPayment();
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const qty = quantities[item.id] || 0;
    const isSelected = qty > 0;

    return (
      <View style={[GLOBAL_STYLES.card, styles.productCard, isSelected ? styles.productCardActive : null]}>
        <View style={styles.iconContainer}>
          {/* Brillo 3D tipo cristal */}
          <View style={styles.glassShine} />
          {item.icon && item.icon.startsWith('/') ? (
            <Image
              source={{ uri: `${BASE_URL}${item.icon}` }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.productIcon}>{item.icon}</Text>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          
          <View style={styles.stockBadgeContainer}>
            {item.stock === 0 ? (
              <Text style={styles.soldOutText}>{t('products.sold_out')}</Text>
            ) : (
              <Text style={styles.productStock}>
                {t('products.stock_label')}: {item.stock - qty}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.counterContainer}>
          <TouchableOpacity 
            style={[styles.counterButton, qty === 0 ? styles.counterButtonDisabled : null]}
            onPress={() => handleDecrement(item.id)}
            disabled={qty === 0}
            activeOpacity={0.7}
          >
            <Text style={styles.counterButtonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.counterValue}>{qty}</Text>
          
          <TouchableOpacity 
            style={styles.counterButton}
            onPress={() => handleIncrement(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <RootContainer scrollEnabled={false} edges={['left', 'right']}>
      <View style={styles.header}>
        <Text style={GLOBAL_STYLES.headerTitle}>{t('products.title')}</Text>
        <Text style={GLOBAL_STYLES.headerSubtitle}>{t('products.subtitle')}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={productsList}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      )}

      {totalItems > 0 && (
        <View style={styles.checkoutBar}>
          <View style={styles.checkoutDetails}>
            <Text style={styles.totalLabel}>{t('products.total_label')}</Text>
            <Text style={styles.totalItemsText}>
              {totalItems} {t('products.items_selected')}
            </Text>
            <Text style={styles.totalPriceText}>{formatPrice(totalPrice)}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={handleCheckout}
            activeOpacity={0.85}
          >
            <Text style={styles.checkoutButtonText}>{t('products.btn_checkout')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </RootContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  listContent: {
    paddingBottom: scale(100),
    paddingHorizontal: SPACING.sm,
  },
  productCard: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: scale(4),
    marginVertical: scale(6),
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: scale(16),
    // 3D elevation shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  productCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  iconContainer: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    backgroundColor: '#3B0764', // Elegant deep violet
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)', // Top highlight ring
    // 3D glow shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  glassShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: scale(36),
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderBottomLeftRadius: scale(36),
    borderBottomRightRadius: scale(36),
  },
  productIcon: {
    fontSize: scale(32),
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: scale(36),
  },
  productInfo: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
    width: '100%',
  },
  productName: {
    fontSize: scale(13),
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: scale(2),
    width: '100%',
  },
  productDescription: {
    fontSize: scale(10),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: scale(6),
    lineHeight: scale(13),
    height: scale(26), // limits to exactly 2 lines height neatly
  },
  productPrice: {
    fontSize: scale(12),
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    textAlign: 'center',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: scale(20),
    paddingHorizontal: scale(4),
    paddingVertical: scale(4),
  },
  counterButton: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonDisabled: {
    opacity: 0.4,
  },
  counterButtonText: {
    color: COLORS.text,
    fontSize: scale(16),
    fontWeight: FONTS.weights.bold,
  },
  counterValue: {
    color: COLORS.text,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    marginHorizontal: scale(8),
    minWidth: scale(16),
    textAlign: 'center',
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  checkoutDetails: {
    flex: 1,
  },
  totalLabel: {
    color: COLORS.textSecondary,
    fontSize: scale(11),
    fontWeight: FONTS.weights.medium,
    textTransform: 'uppercase',
  },
  totalItemsText: {
    color: COLORS.textSecondary,
    fontSize: scale(11),
    marginBottom: scale(2),
  },
  totalPriceText: {
    color: COLORS.text,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: scale(10),
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginLeft: SPACING.md,
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(60),
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: scale(4),
  },
  stockBadgeContainer: {
    marginTop: scale(4),
    alignItems: 'center',
  },
  productStock: {
    fontSize: scale(9),
    color: COLORS.textSecondary,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    paddingHorizontal: scale(6),
    paddingVertical: scale(1.5),
    borderRadius: scale(4),
  },
  soldOutText: {
    fontSize: scale(9),
    color: COLORS.danger,
    fontWeight: FONTS.weights.bold,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: scale(6),
    paddingVertical: scale(1.5),
    borderRadius: scale(4),
  },
});

export default ProductsScreen;
