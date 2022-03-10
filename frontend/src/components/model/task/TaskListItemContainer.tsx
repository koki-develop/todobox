import ListItem, { ListItemProps } from "@mui/material/ListItem";

import { useTheme } from "@mui/material/styles";
import React from "react";

export type TaskListItemContainerProps = ListItemProps;

const TaskListItemContainer: React.VFC<TaskListItemContainerProps> =
  React.forwardRef((props, ref) => {
    const { children, ...listItemProps } = props;
    const theme = useTheme();

    return (
      <ListItem
        {...listItemProps}
        ref={ref}
        disablePadding
        sx={{
          backgroundColor: theme.palette.background.paper,
          marginTop: "-1px",
          ...listItemProps.sx,
        }}
      >
        {children}
      </ListItem>
    );
  });

TaskListItemContainer.displayName = "TaskListItemContainer";

export default TaskListItemContainer;
