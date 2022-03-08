import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardHeader from "@mui/material/CardHeader";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import React, { useCallback, useRef } from "react";
import Link from "@/components/utils/Link";
import Popper from "@/components/utils/Popper";
import { Project } from "@/models/project";

export type ProjectCardProps = {
  project: Project;
  openMenu: boolean;

  onOpenMenu: (project: Project) => void;
  onCloseMenu: (project: Project) => void;
  onDelete: (project: Project) => void;
};

const ProjectCard: React.VFC<ProjectCardProps> = React.memo((props) => {
  const { project, openMenu, onOpenMenu, onCloseMenu, onDelete } = props;

  const menuButtonEl = useRef<HTMLButtonElement | null>(null);

  const handleOpenMenu = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onOpenMenu(project);
    },
    [onOpenMenu, project]
  );

  const handleCloseMenu = useCallback(() => {
    onCloseMenu(project);
  }, [onCloseMenu, project]);

  const handleDelete = useCallback(() => {
    onDelete(project);
  }, [onDelete, project]);

  return (
    <>
      <Card elevation={2}>
        <Link
          to={`/projects/${project.id}`}
          sx={{
            color: (theme) => theme.palette.primary.main,
            textDecoration: "none",
          }}
        >
          <CardActionArea component="div">
            <CardHeader
              title={project.name}
              titleTypographyProps={{
                variant: "h6",
                sx: {
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                },
              }}
              // FIXME: 仮実装
              subheader="12件のタスク"
              sx={{
                "& .MuiCardHeader-content": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
              action={
                <IconButton ref={menuButtonEl} onClick={handleOpenMenu}>
                  <MoreHorizIcon />
                </IconButton>
              }
            />
          </CardActionArea>
        </Link>
      </Card>
      <Popper
        open={openMenu}
        onClose={handleCloseMenu}
        anchorEl={menuButtonEl.current}
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
    </>
  );
});

ProjectCard.displayName = "ProjectCard";

export default ProjectCard;
