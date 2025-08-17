import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '@/src/utils/theme';
import { PasswordStrength } from '@/src/utils/passwordValidation';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  password: string;
}

export default function PasswordStrengthIndicator({ 
  strength, 
  password 
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const getStrengthColor = () => {
    switch (strength.level) {
      case 'weak':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'strong':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const getStrengthLabel = () => {
    switch (strength.level) {
      case 'weak':
        return 'Weak';
      case 'medium':
        return 'Medium';
      case 'strong':
        return 'Strong';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Strength Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${strength.score}%`,
                backgroundColor: getStrengthColor(),
              }
            ]}
          />
        </View>
        <Text style={[styles.strengthLabel, { color: getStrengthColor() }]}>
          {getStrengthLabel()}
        </Text>
      </View>

      {/* Requirements List */}
      <View style={styles.requirementsContainer}>
        {strength.requirements.map((requirement, index) => (
          <View key={index} style={styles.requirementRow}>
            <Ionicons
              name={requirement.met ? 'checkmark-circle' : 'ellipse-outline'}
              size={16}
              color={requirement.met ? colors.success : colors.textSecondary}
              style={styles.requirementIcon}
            />
            <Text 
              style={[
                styles.requirementText,
                requirement.met && styles.requirementTextMet,
              ]}
            >
              {requirement.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthLabel: {
    ...typography.caption,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
  requirementsContainer: {
    gap: spacing.xs,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementIcon: {
    marginRight: spacing.sm,
  },
  requirementText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  requirementTextMet: {
    color: colors.success,
    textDecorationLine: 'line-through',
  },
});