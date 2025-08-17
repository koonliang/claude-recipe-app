import * as yup from 'yup';
import { isPasswordValid } from '@/src/utils/passwordValidation';

export const resetPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .required('New password is required')
    .test(
      'password-strength',
      'Password must meet all requirements',
      (value) => {
        if (!value) return false;
        return isPasswordValid(value);
      }
    ),
  
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

export type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;