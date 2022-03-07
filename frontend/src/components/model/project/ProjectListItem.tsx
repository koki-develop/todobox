import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardHeader from "@mui/material/CardHeader";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import React, { useCallback, useState } from "react";
import Link from "@/components/utils/Link";
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
      setMenuButtonEl(menuButtonEl ? null : e.currentTarget);
    },
    [menuButtonEl]
  );

  const handleCloseMenu = useCallback(() => {
    setMenuButtonEl(null);
  }, []);

  const handleDelete = useCallback(() => {
    onDelete(project);
  }, [onDelete, project]);

  return (
    <Grid item xs={12} sm={6}>
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
                <IconButton onClick={handleClickMenu}>
                  <MoreHorizIcon />
                </IconButton>
              }
            />
          </CardActionArea>
        </Link>
      </Card>
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
    </Grid>
  );
});

ProjectListItem.displayName = "ProjectListItem";

export default ProjectListItem;
