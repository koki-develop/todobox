import { useSnackbar, VariantType } from "notistack";
import React, { useCallback } from "react";

export const useToast = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const showToast = useCallback(
    (message: React.ReactNode, variant: VariantType) => {
      const key = enqueueSnackbar(message, {
        variant,
        onClick: () => closeSnackbar(key),
      });
    },
    [closeSnackbar, enqueueSnackbar]
  );

  return { showToast };
};
