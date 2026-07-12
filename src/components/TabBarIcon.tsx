import React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../theme/theme';
import { scale } from '../utils/responsive';

interface TabBarIconProps {
  name: 'card' | 'history' | 'products';
  active: boolean;
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({ name, active }) => {
  const iconColor = active ? COLORS.primary : COLORS.textSecondary;

  if (name === 'card') {
    // Dibujo Vectorial del ícono de tarjeta (rectángulo con banda magnética y chip)
    return (
      <View style={[styles.cardContainer, { borderColor: iconColor }]}>
        <View style={[styles.cardStripe, { backgroundColor: iconColor }]} />
        <View style={styles.cardBottomRow}>
          <View style={[styles.cardChip, { backgroundColor: iconColor }]} />
          <View style={[styles.cardDot, { backgroundColor: iconColor }]} />
        </View>
      </View>
    );
  }

  if (name === 'history') {
    // Dibujo Vectorial del ícono de reloj/historial (círculo con manecillas)
    return (
      <View style={[styles.clockContainer, { borderColor: iconColor }]}>
        <View style={[styles.clockCenter, { backgroundColor: iconColor }]} />
        <View style={[styles.clockHourHand, { backgroundColor: iconColor }]} />
        <View style={[styles.clockMinuteHand, { backgroundColor: iconColor }]} />
      </View>
    );
  }

  if (name === 'products') {
    // Dibujo Vectorial del ícono de catálogo/productos (cuadrícula de 4 cuadritos)
    return (
      <View style={styles.gridContainer}>
        <View style={[styles.gridRow, { marginBottom: scale(3) }]}>
          <View style={[styles.gridItem, { borderColor: iconColor }]} />
          <View style={[styles.gridItem, { borderColor: iconColor }]} />
        </View>
        <View style={styles.gridRow}>
          <View style={[styles.gridItem, { borderColor: iconColor }]} />
          <View style={[styles.gridItem, { borderColor: iconColor }]} />
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  cardContainer: {
    width: scale(26),
    height: scale(18),
    borderWidth: 2,
    borderRadius: scale(3),
    justifyContent: 'space-between',
    paddingVertical: scale(2),
  },
  cardStripe: {
    height: scale(3),
    width: '100%',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(2),
  },
  cardChip: {
    width: scale(6),
    height: scale(4),
    borderRadius: scale(1),
  },
  cardDot: {
    width: scale(4),
    height: scale(4),
    borderRadius: scale(2),
  },
  clockContainer: {
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  clockCenter: {
    width: scale(4),
    height: scale(4),
    borderRadius: scale(2),
  },
  clockHourHand: {
    width: scale(2),
    height: scale(5),
    position: 'absolute',
    top: scale(4),
  },
  clockMinuteHand: {
    width: scale(5),
    height: scale(2),
    position: 'absolute',
    right: scale(4),
  },
  gridContainer: {
    width: scale(22),
    height: scale(22),
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridItem: {
    width: scale(8),
    height: scale(8),
    borderWidth: 2,
    borderRadius: scale(2),
    marginHorizontal: scale(1.5),
  },
});
export default TabBarIcon;
