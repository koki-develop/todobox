import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
import React from "react";
import Popper, { PopperProps } from "@/components/utils/Popper";

export type PopperListProps = Omit<PopperProps, "children"> & {
  children: React.ReactNode;
};

const PopperList: React.VFC<PopperListProps> = React.memo((props) => {
  const { children, ...popperProps } = props;

  return (
    <Popper {...popperProps} placement={popperProps.placement ?? "bottom-end"}>
      <Paper elevation={3}>
        <List dense>{children}</List>
      </Paper>
    </Popper>
  );
});

PopperList.displayName = "PopperList";

export default PopperList;
