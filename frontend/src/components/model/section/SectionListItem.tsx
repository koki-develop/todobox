import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import React, { useCallback, useRef, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import SectionListItemCard from "@/components/model/section/SectionListItemCard";
import SectionListItemInput from "@/components/model/section/SectionListItemInput";
import TaskList from "@/components/model/task/TaskList";
import PopperList from "@/components/utils/PopperList";
import PopperListItem from "@/components/utils/PopperListItem";
import { Section, UpdateSectionInput } from "@/models/section";
import { Task } from "@/models/task";
import { useSections } from "@/hooks/sectionsHooks";

export type SectionListItemProps = {
  projectId: string;
  section: Section;
  selectedTasks: Task[];
  showCompletedTasks: boolean;

  onDelete: (section: Section) => void;
  onClickTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  onMultiSelectTask: (task: Task) => void;
};

const SectionListItem: React.VFC<SectionListItemProps> = React.memo((props) => {
  const {
    projectId,
    section,
    selectedTasks,
    showCompletedTasks,
    onDelete,
    onClickTask,
    onSelectTask,
    onMultiSelectTask,
  } = props;

  const { updateSection } = useSections();

  const [expanded, setExpanded] = useState<boolean>(true);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);

  const theme = useTheme();

  const handleOpenMenu = useCallback(() => {
    setOpenMenu(true);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setOpenMenu(false);
  }, []);

  const handleExpand = useCallback(() => {
    setExpanded(true);
  }, []);

  const handleCollapse = useCallback(() => {
    setExpanded(false);
  }, []);

  const handleEdit = useCallback(() => {
    setOpenMenu(false);
    setEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditing(false);
  }, []);

  const handleUpdate = useCallback(
    async (input: UpdateSectionInput) => {
      setEditing(false);
      await updateSection(projectId, section, input);
    },
    [projectId, section, updateSection]
  );

  const handleDelete = useCallback(() => {
    setOpenMenu(false);
    onDelete(section);
  }, [onDelete, section]);

  return (
    <Draggable
      isDragDisabled={editing}
      draggableId={section.id}
      index={section.index}
    >
      {(provided) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{ mb: 2 }}
        >
          {editing ? (
            <SectionListItemInput
              section={section}
              onUpdate={handleUpdate}
              onCancel={handleCancelEdit}
            />
          ) : (
            <SectionListItemCard {...provided.dragHandleProps}>
              <IconButton
                size="small"
                sx={{ mr: 1 }}
                onClick={expanded ? handleCollapse : handleExpand}
              >
                {expanded ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
              </IconButton>
              <Typography
                variant="h6"
                sx={{
                  flexGrow: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                [{section.index}] {section.name}
              </Typography>
              <IconButton
                ref={menuButtonRef}
                onClick={handleOpenMenu}
                size="small"
              >
                <MoreHorizIcon />
              </IconButton>
              <PopperList
                anchorEl={menuButtonRef.current}
                open={openMenu}
                onClose={handleCloseMenu}
                placement="bottom-end"
                clickAwayListenerProps={{
                  mouseEvent: "onMouseDown",
                }}
              >
                <PopperListItem onClick={handleEdit}>
                  <ListItemIcon>
                    <EditIcon />
                  </ListItemIcon>
                  <ListItemText primary="セクションを編集" />
                </PopperListItem>
                <PopperListItem onClick={handleDelete}>
                  <ListItemIcon>
                    <DeleteIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="セクションを削除"
                    primaryTypographyProps={{
                      sx: {
                        color: theme.palette.error.main,
                      },
                    }}
                  />
                </PopperListItem>
              </PopperList>
            </SectionListItemCard>
          )}
          {expanded && (
            <TaskList
              projectId={projectId}
              sectionId={section.id}
              selectedTasks={selectedTasks}
              showCompletedTasks={showCompletedTasks}
              onClickTask={onClickTask}
              onSelectTask={onSelectTask}
              onMultiSelectTask={onMultiSelectTask}
            />
          )}
        </Box>
      )}
    </Draggable>
  );
});

SectionListItem.displayName = "SectionListItem";

export default SectionListItem;
