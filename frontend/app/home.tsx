import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts';
import { LogoutButton, FloatingActionButton } from '@/src/components';
import { RecipeListScreen } from '@/src/screens';
import { colors, typography, spacing } from '@/src/utils/theme';

export default function AuthenticatedHomeScreen() {
  const router = useRouter();
  const { user, isLoading, isAnonymous } = useAuth();

  const handleAddRecipe = () => {
    router.push({
      pathname: '/recipe-form',
      params: { mode: 'create' }
    });
  };

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
      
      <View style={styles.header}>
        <Text style={styles.title}>MyRecipeBox</Text>
        <Text style={styles.subtitle}>
          Welcome{isAnonymous ? ' to the demo' : ' back'}, {user?.fullName}!
        </Text>
        <LogoutButton
          title="Sign Out"
          variant="link"
          testID="home-logout-button"
        />
      </View>

      <View style={styles.recipeListContainer}>
        <RecipeListScreen />
      </View>

      <FloatingActionButton
        onPress={handleAddRecipe}
        testID="add-recipe-fab"
      />
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  recipeListContainer: {
    flex: 1,
  },
});