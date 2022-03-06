import ListItemButton, {
  ListItemButtonProps,
} from "@mui/material/ListItemButton";
import React from "react";
import { Link, LinkProps } from "react-router-dom";

export type ListItemLinkProps = ListItemButtonProps & Pick<LinkProps, "to">;

const ListItemLink: React.VFC<ListItemLinkProps> = React.forwardRef(
  (props, ref) => {
    const { to, ...listItemButtonProps } = props;

    return (
      <Link to={to} style={{ width: "100%" }}>
        <ListItemButton {...listItemButtonProps} ref={ref} />
      </Link>
    );
  }
);

ListItemLink.displayName = "ListItemLink";

export default ListItemLink;
