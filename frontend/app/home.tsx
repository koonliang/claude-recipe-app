import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/src/contexts';
import { LogoutButton } from '@/src/components';
import { colors, typography, spacing } from '@/src/utils/theme';

export default function AuthenticatedHomeScreen() {
  const { user, isLoading, isAnonymous } = useAuth();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isAnonymous && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>🔍 Demo Mode - Explore all features!</Text>
        </View>
      )}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>MyRecipeBox</Text>
          <Text style={styles.subtitle}>
            Welcome{isAnonymous ? ' to the demo' : ' back'}, {user?.full_name}!
          </Text>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.userCard}>
            <Text style={styles.userLabel}>User Information</Text>
            <Text style={styles.userName}>{user?.full_name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.recipeSection}>
          <Text style={styles.sectionTitle}>Your Recipes</Text>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Recipe management features will be implemented in future steps.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <LogoutButton
            title="Sign Out"
            variant="outline"
            testID="home-logout-button"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  demoBanner: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  demoBannerText: {
    ...typography.caption,
    color: colors.white || '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.h3,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  userInfo: {
    marginBottom: spacing.xl,
  },
  userCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.body,
    color: colors.textSecondary,
  },
  recipeSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  placeholder: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actions: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});