import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecipeStep } from '@/src/types';
import { colors, typography, spacing, borderRadius } from '@/src/utils/theme';

export interface CookingStepsProps {
  steps: RecipeStep[];
  testID?: string;
}

export const CookingSteps = memo(({ steps, testID }: CookingStepsProps) => {
  // Sort steps by step_number to ensure proper order
  const sortedSteps = [...steps].sort((a, b) => a.step_number - b.step_number);

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <Ionicons name="list" size={24} color={colors.primary} />
        <Text style={styles.title}>Instructions</Text>
        <View style={styles.count}>
          <Text style={styles.countText}>{steps.length}</Text>
        </View>
      </View>
      
      <View style={styles.stepsList}>
        {sortedSteps.map((step, index) => (
          <View key={step.id} style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>
                {step.step_number}
              </Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>
                {step.instruction_text}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
});

CookingSteps.displayName = 'CookingSteps';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    margin: spacing.md,
    padding: spacing.lg,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    flex: 1,
    marginLeft: spacing.sm,
  },
  count: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  countText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  stepsList: {
    gap: spacing.lg,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  stepNumberText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  stepText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
});