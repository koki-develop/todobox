import React, { useMemo } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import TaskList from "@/components/model/task/TaskList";
import { Section } from "@/models/section";
import { Task } from "@/models/task";

export type SectionListProps = {
  sections: Section[];
  tasks: Task[];
  selectedTasks: Task[];

  onCreateTask: (task: Task) => void;
  onClickTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  onMultiSelectTask: (task: Task) => void;
};

const SectionList: React.VFC<SectionListProps> = React.memo((props) => {
  const {
    sections,
    tasks,
    selectedTasks,
    onCreateTask,
    onClickTask,
    onSelectTask,
    onMultiSelectTask,
  } = props;

  const sectionsWithTasks: { section: Section; tasks: Task[] }[] =
    useMemo(() => {
      return sections.map((section) => {
        return {
          section,
          tasks: tasks.filter((task) => task.sectionId === section.id),
        };
      });
    }, [sections, tasks]);

  return (
    <Droppable droppableId="sections" type="sections">
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps}>
          {sectionsWithTasks
            .sort((a, b) => a.section.index - b.section.index)
            .map((sectionWithTasks) => (
              <Draggable
                key={sectionWithTasks.section.id}
                draggableId={sectionWithTasks.section.id}
                index={sectionWithTasks.section.index}
              >
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps}>
                    <div {...provided.dragHandleProps}>
                      {sectionWithTasks.section.name}
                    </div>
                    <TaskList
                      sectionId={sectionWithTasks.section.id}
                      tasks={sectionWithTasks.tasks}
                      selectedTasks={selectedTasks}
                      onCreateTask={onCreateTask}
                      onClickTask={onClickTask}
                      onSelectTask={onSelectTask}
                      onMultiSelectTask={onMultiSelectTask}
                    />
                  </div>
                )}
              </Draggable>
            ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
});

SectionList.displayName = "SectionList";

export default SectionList;
