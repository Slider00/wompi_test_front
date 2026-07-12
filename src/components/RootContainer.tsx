import React from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  View,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../theme/theme';

interface RootContainerProps {
  children: React.ReactNode;
  scrollEnabled?: boolean;
  edges?: Edge[];
}

export const RootContainer: React.FC<RootContainerProps> = ({
  children,
  scrollEnabled = true,
  edges = ['top', 'left', 'right'],
}) => {
  const content = scrollEnabled ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.flexContent}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.windowPadding,
    paddingVertical: SPACING.md,
  },
  flexContent: {
    flex: 1,
    paddingHorizontal: SPACING.windowPadding,
    paddingVertical: SPACING.md,
  },
});
export default RootContainer;
