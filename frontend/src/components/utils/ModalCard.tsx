import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import React from "react";
import Modal, { ModalProps } from "@/components/utils/Modal";

export type ModalCardProps = Omit<ModalProps, "children"> & {
  children: React.ReactNode;
};

const ModalCard: React.VFC<ModalCardProps> = React.memo((props) => {
  const { children, ...modalProps } = props;

  return (
    <Modal {...modalProps}>
      <Container maxWidth="sm" sx={{ outline: "none" }}>
        <Card>{children}</Card>
      </Container>
    </Modal>
  );
});

ModalCard.displayName = "ModalCard";

export default ModalCard;
