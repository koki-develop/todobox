import React, { useCallback } from "react";
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

  const handleDelete = useCallback(() => {
    onDelete(section);
  }, [onDelete, section]);

  return (
    <Draggable draggableId={section.id} index={section.index}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          <div>
            <span {...provided.dragHandleProps}>handle</span>
            <span>
              {" "}
              [{section.index}]{section.name}
            </span>
            <span>
              <button onClick={handleDelete}>delete</button>
            </span>
          </div>
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
        </div>
      )}
    </Draggable>
  );
});

SectionListItem.displayName = "SectionListItem";

export default SectionListItem;
