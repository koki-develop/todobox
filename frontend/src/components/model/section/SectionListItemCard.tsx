import Card, { CardProps } from "@mui/material/Card";
import React from "react";

export type SectionListItemCardProps = CardProps;

const SectionListItemCard: React.VFC<SectionListItemCardProps> =
  React.forwardRef((props, ref) => {
    const { children, ...cardProps } = props;

    return (
      <Card
        {...cardProps}
        ref={ref}
        square
        variant="outlined"
        sx={{
          alignItems: "center",
          display: "flex",
          height: 50,
          px: 1,
          ...cardProps.sx,
        }}
      >
        {children}
      </Card>
    );
  });

SectionListItemCard.displayName = "SectionListItemCard";

export default SectionListItemCard;
