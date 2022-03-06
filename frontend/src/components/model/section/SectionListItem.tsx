import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import IconButton from "@mui/material/IconButton";
import React, { useCallback, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import TaskList from "@/components/model/task/TaskList";
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
          <Card square {...provided.dragHandleProps}>
            <CardHeader
              sx={{ p: 1, pr: 2 }}
              avatar={
                expanded ? (
                  <IconButton size="small" onClick={handleCollapse}>
                    <ArrowDropDownIcon />
                  </IconButton>
                ) : (
                  <IconButton size="small" onClick={handleExpand}>
                    <ArrowRightIcon />
                  </IconButton>
                )
              }
              action={
                <IconButton onClick={handleDelete}>
                  <DeleteIcon />
                </IconButton>
              }
              title={`[${section.index}] ${section.name}`}
              titleTypographyProps={{ variant: "h6" }}
            />
          </Card>
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
