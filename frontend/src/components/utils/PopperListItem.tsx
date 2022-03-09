import ListItem from "@mui/material/ListItem";
import ListItemButton, {
  ListItemButtonProps,
} from "@mui/material/ListItemButton";
import React from "react";

export type PopperListItemProps = ListItemButtonProps;

const PopperListItem: React.VFC<PopperListItemProps> = React.memo((props) => {
  const { ...listItemButtonProps } = props;

  return (
    <ListItem disablePadding>
      <ListItemButton {...listItemButtonProps} />
    </ListItem>
  );
});

PopperListItem.displayName = "PopperListItem";

export default PopperListItem;
