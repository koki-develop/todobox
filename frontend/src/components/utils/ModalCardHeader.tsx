import CardHeader, { CardHeaderProps } from "@mui/material/CardHeader";
import React from "react";

export type ModalCardHeaderProps = CardHeaderProps;

const ModalCardHeader: React.VFC<ModalCardHeaderProps> = React.memo((props) => {
  const { ...modalCardHeaderProps } = props;

  return (
    <CardHeader
      {...modalCardHeaderProps}
      titleTypographyProps={{
        variant: "h6",
        ...modalCardHeaderProps.titleTypographyProps,
      }}
      sx={{ pb: 0, ...modalCardHeaderProps.sx }}
    />
  );
});

ModalCardHeader.displayName = "ModalCardHeader";

export default ModalCardHeader;
