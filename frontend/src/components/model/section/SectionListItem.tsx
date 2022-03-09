import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import React, { useCallback, useRef, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import SectionListItemCard from "@/components/model/section/SectionListItemCard";
import TaskList from "@/components/model/task/TaskList";
import Popper from "@/components/utils/Popper";
import { Section } from "@/models/section";
import { Task } from "@/models/task";

export type SectionListItemProps = {
  projectId: string;
  section: Section;
  tasks: Task[];
  selectedTasks: Task[];

  onDelete: (section: Section) => void;
  onCompleteTask: (task: Task) => void;
  onIncompleteTask: (task: Task) => void;
  onCreateTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onClickTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  onMultiSelectTask: (task: Task) => void;
};

const SectionListItem: React.VFC<SectionListItemProps> = React.memo((props) => {
  const {
    projectId,
    section,
    tasks,
    selectedTasks,
    onDelete,
    onCompleteTask,
    onIncompleteTask,
    onCreateTask,
    onDeleteTask,
    onClickTask,
    onSelectTask,
    onMultiSelectTask,
  } = props;

  const [expanded, setExpanded] = useState<boolean>(true);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const [openMenu, setOpenMenu] = useState<boolean>(false);

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

  const handleDelete = useCallback(() => {
    onDelete(section);
  }, [onDelete, section]);

  return (
    <Draggable draggableId={section.id} index={section.index}>
      {(provided) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{ mb: 2 }}
        >
          <SectionListItemCard {...provided.dragHandleProps}>
            <IconButton
              size="small"
              sx={{ mr: 1 }}
              onClick={expanded ? handleCollapse : handleExpand}
            >
              {expanded ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              [{section.index}] {section.name}
            </Typography>
            <IconButton ref={menuButtonRef} onClick={handleOpenMenu}>
              <MoreHorizIcon />
            </IconButton>
            <Popper
              anchorEl={menuButtonRef.current}
              open={openMenu}
              onClose={handleCloseMenu}
              placement="bottom-end"
            >
              <Paper>
                <List dense>
                  <ListItem disablePadding>
                    <ListItemButton onClick={handleDelete}>
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
                    </ListItemButton>
                  </ListItem>
                </List>
              </Paper>
            </Popper>
          </SectionListItemCard>
          {expanded && (
            <TaskList
              projectId={projectId}
              sectionId={section.id}
              tasks={tasks}
              selectedTasks={selectedTasks}
              onCompleteTask={onCompleteTask}
              onIncompleteTask={onIncompleteTask}
              onDeleteTask={onDeleteTask}
              onCreateTask={onCreateTask}
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
