import Card, { CardProps } from "@mui/material/Card";
import Container from "@mui/material/Container";
import React from "react";
import Modal, { ModalProps } from "@/components/utils/Modal";

export type ModalCardProps = Omit<ModalProps, "children"> & {
  children: React.ReactNode;
  cardProps?: CardProps;
};

const ModalCard: React.VFC<ModalCardProps> = React.memo((props) => {
  const { children, cardProps, ...modalProps } = props;

  return (
    <Modal {...modalProps}>
      <Container maxWidth="sm" sx={{ outline: "none" }}>
        <Card {...cardProps}>{children}</Card>
      </Container>
    </Modal>
  );
});

ModalCard.displayName = "ModalCard";

export default ModalCard;
