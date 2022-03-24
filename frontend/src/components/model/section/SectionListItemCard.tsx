import Card, { CardProps } from "@mui/material/Card";
import { useTheme } from "@mui/material/styles";
import React from "react";

export type SectionListItemCardProps = CardProps & {
  dragging?: boolean;
};

const SectionListItemCard: React.VFC<SectionListItemCardProps> =
  React.forwardRef((props, ref) => {
    const { children, dragging, ...cardProps } = props;
    const theme = useTheme();

    return (
      <Card
        {...cardProps}
        ref={ref}
        square
        variant="outlined"
        sx={{
          alignItems: "center",
          boxShadow: dragging ? theme.shadows[2] : undefined,
          display: "flex",
          height: 50,
          px: 1,
          transition: "box-shadow 0s",
          ...cardProps.sx,
        }}
      >
        {children}
      </Card>
    );
  });

SectionListItemCard.displayName = "SectionListItemCard";

export default SectionListItemCard;
