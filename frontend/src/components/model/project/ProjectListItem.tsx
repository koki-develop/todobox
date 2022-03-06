import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import React, { useCallback, useState } from "react";
import ListItemLink from "@/components/utils/ListItemLink";
import Popper from "@/components/utils/Popper";
import { Project } from "@/models/project";

export type ProjectListItemProps = {
  project: Project;

  onDelete: (project: Project) => void;
};

const ProjectListItem: React.VFC<ProjectListItemProps> = React.memo((props) => {
  const { project, onDelete } = props;

  const [menuButtonEl, setMenuButtonEl] = useState<HTMLButtonElement | null>(
    null
  );

  const handleClickMenu = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setMenuButtonEl((prev) => (prev ? null : e.currentTarget));
    },
    []
  );

  const handleCloseMenu = useCallback(() => {
    setMenuButtonEl(null);
  }, []);

  const handleDelete = useCallback(() => {
    onDelete(project);
  }, [onDelete, project]);

  const handleMouseDownMenu = useCallback(
    (
      e:
        | React.MouseEvent<HTMLButtonElement>
        | React.TouchEvent<HTMLButtonElement>
    ) => {
      e.stopPropagation();
    },
    []
  );

  return (
    <ListItem disablePadding>
      <ListItemLink to={`/projects/${project.id}`}>
        <ListItemText primary={project.name} />
        <IconButton
          onMouseDown={handleMouseDownMenu}
          onTouchStart={handleMouseDownMenu}
          onClick={handleClickMenu}
        >
          <MoreHorizIcon />
        </IconButton>
      </ListItemLink>
      <Popper
        open={Boolean(menuButtonEl)}
        onClose={handleCloseMenu}
        anchorEl={menuButtonEl}
      >
        <Paper>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleDelete}>
                <ListItemText primary="削除" />
              </ListItemButton>
            </ListItem>
          </List>
        </Paper>
      </Popper>
    </ListItem>
  );
});

ProjectListItem.displayName = "ProjectListItem";

export default ProjectListItem;
