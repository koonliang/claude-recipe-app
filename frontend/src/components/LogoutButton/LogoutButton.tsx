import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Button } from '../Button';
import { ConfirmationDialog } from '../ConfirmationDialog';
import { useAuth } from '@/src/contexts';
import { router } from 'expo-router';

export interface LogoutButtonProps {
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'link';
  showConfirmation?: boolean;
  onLogoutStart?: () => void;
  onLogoutSuccess?: () => void;
  onLogoutError?: (error: string) => void;
  testID?: string;
}

export function LogoutButton({
  title = 'Logout',
  variant = 'outline',
  showConfirmation = true,
  onLogoutStart,
  onLogoutSuccess,
  onLogoutError,
  testID = 'logout-button',
}: LogoutButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { logout, isLoading } = useAuth();

  const handleLogoutPress = () => {
    if (showConfirmation) {
      setShowDialog(true);
    } else {
      performLogout();
    }
  };

  const performLogout = async () => {
    onLogoutStart?.();

    try {
      await logout();
      
      // Reset navigation stack and navigate to login
      router.replace('/login');
      
      onLogoutSuccess?.();
    } catch (error) {
      console.error('Logout error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to logout. Please try again.';
      
      // Show alert for logout error but still redirect to login
      // since local data cleanup is the primary goal
      Alert.alert(
        'Logout Warning',
        'There was an issue during logout, but you have been signed out locally.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
      
      onLogoutError?.(errorMessage);
    } finally {
      setShowDialog(false);
    }
  };

  const handleCancel = () => {
    setShowDialog(false);
  };

  const handleConfirm = () => {
    performLogout();
  };

  return (
    <>
      <Button
        title={title}
        onPress={handleLogoutPress}
        variant={variant}
        loading={isLoading}
        disabled={isLoading}
        testID={testID}
      />

      <ConfirmationDialog
        visible={showDialog}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        loading={isLoading}
        destructive
        testID={`${testID}-confirmation`}
      />
    </>
  );
}