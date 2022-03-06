import ListItemButton, {
  ListItemButtonProps,
} from "@mui/material/ListItemButton";
import React, { useCallback } from "react";
import { Link, LinkProps, useNavigate } from "react-router-dom";

export type ListItemLinkProps = Omit<ListItemButtonProps, "onClick"> &
  Pick<LinkProps, "to">;

const ListItemLink: React.VFC<ListItemLinkProps> = React.forwardRef(
  (props, ref) => {
    const { to, ...listItemButtonProps } = props;

    const navigate = useNavigate();

    const handleClickLink = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
      },
      []
    );

    const handleClickButton = useCallback(() => {
      navigate(to);
    }, [navigate, to]);

    return (
      <Link to={to} style={{ width: "100%" }} onClick={handleClickLink}>
        <ListItemButton
          {...listItemButtonProps}
          ref={ref}
          onClick={handleClickButton}
        />
      </Link>
    );
  }
);

ListItemLink.displayName = "ListItemLink";

export default ListItemLink;
