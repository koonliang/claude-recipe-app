import * as yup from 'yup';
import { isPasswordValid } from '@/src/utils/passwordValidation';

export const signupSchema = yup.object().shape({
  full_name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must be less than 50 characters')
    .trim(),
  
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .lowercase()
    .trim(),
  
  password: yup
    .string()
    .required('Password is required')
    .test(
      'password-strength',
      'Password must meet all requirements',
      (value) => {
        if (!value) return false;
        return isPasswordValid(value);
      }
    ),
});

export type SignupFormData = yup.InferType<typeof signupSchema>;