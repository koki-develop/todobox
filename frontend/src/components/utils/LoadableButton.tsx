import { Button, ButtonProps, CircularProgress } from "@mui/material";
import React from "react";

export type LoadableButtonProps = ButtonProps & {
  loading: boolean;
};

const LoadableButton: React.VFC<LoadableButtonProps> = React.memo((props) => {
  const { loading, children, disabled, ...buttonProps } = props;

  return (
    <Button {...buttonProps} disabled={disabled || loading}>
      {children}
      {loading && <CircularProgress size={24} sx={{ position: "absolute" }} />}
    </Button>
  );
});

LoadableButton.displayName = "LoadableButton";

export default LoadableButton;
