import React, { useCallback, useMemo, useState } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { ulid } from "ulid";
import TaskList from "@/components/model/task/TaskList";
import { Section } from "@/models/section";
import { Task } from "@/models/task";

export type SectionListProps = {
  projectId: string;
  sections: Section[];
  tasks: Task[];
  selectedTasks: Task[];

  onCreateSection: (section: Section) => void;
  onCreateTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onClickTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  onMultiSelectTask: (task: Task) => void;
};

const SectionList: React.VFC<SectionListProps> = React.memo((props) => {
  const {
    projectId,
    sections,
    tasks,
    selectedTasks,
    onCreateSection,
    onCreateTask,
    onDeleteTask,
    onClickTask,
    onSelectTask,
    onMultiSelectTask,
  } = props;

  const [name, setName] = useState<string>("");

  const sectionsWithTasks: { section: Section; tasks: Task[] }[] =
    useMemo(() => {
      return sections.map((section) => {
        return {
          section,
          tasks: tasks.filter((task) => task.sectionId === section.id),
        };
      });
    }, [sections, tasks]);

  const handleChangeName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.currentTarget.value);
    },
    []
  );

  const handleCreate = useCallback(() => {
    const trimmedName = name.trim();
    if (trimmedName === "") return;
    setName("");
    const index = sections.length === 0 ? 0 : sections.slice(-1)[0].index + 1;
    onCreateSection({ projectId, id: ulid(), name: trimmedName, index });
  }, [name, onCreateSection, projectId, sections]);

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
                      onDeleteTask={onDeleteTask}
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
          <div>
            <input type="text" value={name} onChange={handleChangeName} />
            <button onClick={handleCreate}>create</button>
          </div>
        </div>
      )}
    </Droppable>
  );
});

SectionList.displayName = "SectionList";

export default SectionList;
