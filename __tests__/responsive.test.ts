import { scale, verticalScale, moderateScale, isTablet, screenWidth } from '../src/utils/responsive';

describe('Responsive Utility Tests', () => {
  test('scale should calculate proportional width', () => {
    // Para ancho base de 375, si el screenWidth es W, scale(x) = (W / 375) * x
    const input = 100;
    const expected = (screenWidth / 375) * input;
    expect(scale(input)).toBeCloseTo(expected, 4);
  });

  test('verticalScale should calculate proportional height', () => {
    // Para alto base de 667, verticalScale(y) = (screenHeight / 667) * y
    const input = 200;
    const { height: screenHeight } = require('react-native').Dimensions.get('window');
    const expected = (screenHeight / 667) * input;
    expect(verticalScale(input)).toBeCloseTo(expected, 4);
  });

  test('moderateScale should apply scaling factor correctly', () => {
    const size = 16;
    const factor = 0.5;
    const scaled = scale(size);
    const expected = size + (scaled - size) * factor;
    expect(moderateScale(size, factor)).toBeCloseTo(expected, 4);
  });

  test('isTablet returns boolean', () => {
    const result = isTablet();
    expect(typeof result).toBe('boolean');
  });
});
