import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardHeader from "@mui/material/CardHeader";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useTheme } from "@mui/material/styles";
import React, { useCallback, useRef, useState } from "react";
import Link from "@/components/utils/Link";
import PopperList from "@/components/utils/PopperList";
import PopperListItem from "@/components/utils/PopperListItem";
import { Project } from "@/models/project";

export type ProjectCardProps = {
  project: Project;

  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
};

const ProjectCard: React.VFC<ProjectCardProps> = React.memo((props) => {
  const { project, onEdit, onDelete } = props;

  const theme = useTheme();

  const menuButtonEl = useRef<HTMLButtonElement | null>(null);
  const [openMenu, setOpenMenu] = useState<boolean>(false);

  const handleOpenMenu = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setOpenMenu(true);
    },
    []
  );

  const handleCloseMenu = useCallback(() => {
    setOpenMenu(false);
  }, []);

  const handleEdit = useCallback(() => {
    setOpenMenu(false);
    onEdit(project);
  }, [onEdit, project]);

  const handleDelete = useCallback(() => {
    setOpenMenu(false);
    onDelete(project);
  }, [onDelete, project]);

  return (
    <>
      <Card elevation={2}>
        <Link
          to={`/projects/${project.id}`}
          sx={{
            color: theme.palette.primary.main,
            textDecoration: "none",
          }}
        >
          <CardActionArea
            component="div"
            sx={{ color: theme.palette.text.primary }}
          >
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
      <PopperList
        open={openMenu}
        onClose={handleCloseMenu}
        anchorEl={menuButtonEl.current}
      >
        <PopperListItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText primary="プロジェクトを編集" />
        </PopperListItem>
        <PopperListItem
          onClick={handleDelete}
          sx={{ color: theme.palette.error.main }}
        >
          <ListItemIcon>
            <DeleteIcon color="error" />
          </ListItemIcon>
          <ListItemText primary="プロジェクトを削除" />
        </PopperListItem>
      </PopperList>
    </>
  );
});

ProjectCard.displayName = "ProjectCard";

export default ProjectCard;
