import { useState, useCallback } from 'react';

export interface UseConfirmDialogOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

export interface UseConfirmDialogReturn {
  isVisible: boolean;
  showDialog: () => void;
  hideDialog: () => void;
  confirm: () => void;
  cancel: () => void;
  dialogProps: {
    visible: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onCancel: () => void;
  };
}

export const useConfirmDialog = (
  onConfirm: () => void | Promise<void>,
  options: UseConfirmDialogOptions = {}
): UseConfirmDialogReturn => {
  const [isVisible, setIsVisible] = useState(false);
  
  const {
    title = 'Confirm Action',
    message = 'Are you sure you want to continue?',
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  } = options;

  const showDialog = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideDialog = useCallback(() => {
    setIsVisible(false);
  }, []);

  const confirm = useCallback(async () => {
    setIsVisible(false);
    await onConfirm();
  }, [onConfirm]);

  const cancel = useCallback(() => {
    setIsVisible(false);
  }, []);

  const dialogProps = {
    visible: isVisible,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm: confirm,
    onCancel: cancel,
  };

  return {
    isVisible,
    showDialog,
    hideDialog,
    confirm,
    cancel,
    dialogProps,
  };
};