import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import React, { useCallback, useMemo, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import SectionListItem from "@/components/model/section/SectionListItem";
import SectionNewListItem from "@/components/model/section/SectionNewListItem";
import { Section } from "@/models/section";
import { Task } from "@/models/task";

export type SectionListProps = {
  projectId: string;
  sections: Section[];
  tasks: Task[];
  selectedTasks: Task[];

  onCreateSection: (section: Section) => void;
  onDeleteSection: (section: Section) => void;
  onCompleteTask: (task: Task) => void;
  onIncompleteTask: (task: Task) => void;
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
    onDeleteSection,
    onCompleteTask,
    onIncompleteTask,
    onCreateTask,
    onDeleteTask,
    onClickTask,
    onSelectTask,
    onMultiSelectTask,
  } = props;

  const [inputtingNewSection, setInputtingNewSection] =
    useState<boolean>(false);

  const sectionsWithTasks: { section: Section; tasks: Task[] }[] =
    useMemo(() => {
      return sections.map((section) => {
        return {
          section,
          tasks: tasks.filter((task) => task.sectionId === section.id),
        };
      });
    }, [sections, tasks]);

  const handleStartCreateSection = useCallback(() => {
    setInputtingNewSection(true);
  }, []);

  const handleCancelCreateSection = useCallback(() => {
    setInputtingNewSection(false);
  }, []);

  const handleCreateSection = useCallback(
    (section: Section) => {
      setInputtingNewSection(false);
      onCreateSection(section);
    },
    [onCreateSection]
  );

  return (
    <Droppable droppableId="sections" type="sections">
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps}>
          {sectionsWithTasks
            .sort((a, b) => a.section.index - b.section.index)
            .map((sectionWithTasks) => (
              <SectionListItem
                key={sectionWithTasks.section.id}
                projectId={projectId}
                section={sectionWithTasks.section}
                tasks={sectionWithTasks.tasks}
                selectedTasks={selectedTasks}
                onDelete={onDeleteSection}
                onCompleteTask={onCompleteTask}
                onIncompleteTask={onIncompleteTask}
                onDeleteTask={onDeleteTask}
                onCreateTask={onCreateTask}
                onClickTask={onClickTask}
                onSelectTask={onSelectTask}
                onMultiSelectTask={onMultiSelectTask}
              />
            ))}
          {provided.placeholder}
          {inputtingNewSection ? (
            <SectionNewListItem
              projectId={projectId}
              sections={sections}
              onCreate={handleCreateSection}
              onCancel={handleCancelCreateSection}
            />
          ) : (
            <Button startIcon={<AddIcon />} onClick={handleStartCreateSection}>
              セクションを追加
            </Button>
          )}
        </div>
      )}
    </Droppable>
  );
});

SectionList.displayName = "SectionList";

export default SectionList;
