import Fade from "@mui/material/Fade";
import MuiModal, { ModalProps as MuiModalProps } from "@mui/material/Modal";
import React from "react";

export type ModalProps = MuiModalProps;

const Modal: React.VFC<ModalProps> = React.memo((props) => {
  const { open, children, ...modalProps } = props;

  return (
    <MuiModal
      {...modalProps}
      closeAfterTransition
      open={open}
      BackdropProps={{ timeout: 200, ...modalProps.BackdropProps }}
      sx={{
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        ...modalProps.sx,
      }}
    >
      <Fade in={open} timeout={200}>
        {children}
      </Fade>
    </MuiModal>
  );
});

Modal.displayName = "Modal";

export default Modal;
