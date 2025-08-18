import { useState, useCallback, useMemo } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePickerExpo from 'expo-image-picker';

export interface UseImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export interface UseImagePickerReturn {
  isLoading: boolean;
  requestPermissions: () => Promise<boolean>;
  openCamera: () => Promise<string | null>;
  openImageLibrary: () => Promise<string | null>;
  showImagePickerOptions: () => Promise<string | null>;
  validateImage: (uri: string) => Promise<boolean>;
}

const DEFAULT_OPTIONS: UseImagePickerOptions = {
  allowsEditing: true,
  aspect: [16, 9],
  quality: 0.8,
  maxSizeMB: 5,
  allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
};

export function useImagePicker(options: UseImagePickerOptions = {}): UseImagePickerReturn {
  const [isLoading, setIsLoading] = useState(false);
  
  const config = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') return true;

    try {
      const { status: cameraStatus } = await ImagePickerExpo.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePickerExpo.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please grant camera and photo library permissions to add recipe photos.',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      return true;
    } catch {
      Alert.alert(
        'Permission Error',
        'Unable to request permissions. Please check your device settings.',
        [{ text: 'OK' }]
      );
      return false;
    }
  }, []);

  const validateImage = useCallback(async (uri: string): Promise<boolean> => {
    try {
      if (Platform.OS !== 'web') {
        // Get file info for validation
        const response = await fetch(uri);
        const blob = await response.blob();
        
        // Check file size
        if (config.maxSizeMB && blob.size > config.maxSizeMB * 1024 * 1024) {
          Alert.alert(
            'File Too Large',
            `Image must be smaller than ${config.maxSizeMB}MB. Please choose a smaller image or compress it.`,
            [{ text: 'OK' }]
          );
          return false;
        }

        // Check file type
        if (config.allowedTypes && !config.allowedTypes.includes(blob.type)) {
          Alert.alert(
            'Invalid File Type',
            'Only JPEG and PNG images are allowed.',
            [{ text: 'OK' }]
          );
          return false;
        }
      }
      
      return true;
    } catch {
      Alert.alert(
        'Validation Error',
        'Unable to validate the selected image. Please try again.',
        [{ text: 'OK' }]
      );
      return false;
    }
  }, [config.maxSizeMB, config.allowedTypes]);

  const openCamera = useCallback(async (): Promise<string | null> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    setIsLoading(true);
    try {
      const result = await ImagePickerExpo.launchCameraAsync({
        mediaTypes: ImagePickerExpo.MediaTypeOptions.Images,
        allowsEditing: config.allowsEditing,
        aspect: config.aspect,
        quality: config.quality,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const isValid = await validateImage(imageUri);
        
        if (isValid) {
          return imageUri;
        }
      }
      
      return null;
    } catch {
      Alert.alert(
        'Camera Error',
        'Failed to take photo. Please try again.',
        [{ text: 'OK' }]
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [requestPermissions, validateImage, config]);

  const openImageLibrary = useCallback(async (): Promise<string | null> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    setIsLoading(true);
    try {
      const result = await ImagePickerExpo.launchImageLibraryAsync({
        mediaTypes: ImagePickerExpo.MediaTypeOptions.Images,
        allowsEditing: config.allowsEditing,
        aspect: config.aspect,
        quality: config.quality,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const isValid = await validateImage(imageUri);
        
        if (isValid) {
          return imageUri;
        }
      }
      
      return null;
    } catch {
      Alert.alert(
        'Gallery Error',
        'Failed to select photo. Please try again.',
        [{ text: 'OK' }]
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [requestPermissions, validateImage, config]);

  const showImagePickerOptions = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Select Photo',
        'Choose how you want to add a photo',
        [
          {
            text: 'Camera',
            onPress: async () => {
              const uri = await openCamera();
              resolve(uri);
            },
          },
          {
            text: 'Photo Library',
            onPress: async () => {
              const uri = await openImageLibrary();
              resolve(uri);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ]
      );
    });
  }, [openCamera, openImageLibrary]);

  return {
    isLoading,
    requestPermissions,
    openCamera,
    openImageLibrary,
    showImagePickerOptions,
    validateImage,
  };
}