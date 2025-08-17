import * as yup from 'yup';

export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .lowercase()
    .trim(),
});

export type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;