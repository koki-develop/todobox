import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import React, { useCallback, useMemo, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import SectionListItem from "@/components/model/section/SectionListItem";
import SectionListItemInput from "@/components/model/section/SectionListItemInput";
import { CreateSectionInput, Section } from "@/models/section";
import { Task } from "@/models/task";
import { useSections } from "@/hooks/sectionHooks";

export type SectionListProps = {
  projectId: string;
  sections: Section[];
  tasks: Task[];
  selectedTasks: Task[];

  onUpdateSection: (section: Section) => void;
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
    onUpdateSection,
    onDeleteSection,
    onCompleteTask,
    onIncompleteTask,
    onCreateTask,
    onDeleteTask,
    onClickTask,
    onSelectTask,
    onMultiSelectTask,
  } = props;

  const { createSection } = useSections();

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
    async (input: CreateSectionInput) => {
      setInputtingNewSection(false);
      createSection(projectId, input);
    },
    [createSection, projectId]
  );

  return (
    <Droppable droppableId="sections" type="sections">
      {(provided) => (
        <Box ref={provided.innerRef} {...provided.droppableProps}>
          {sectionsWithTasks
            .sort((a, b) => a.section.index - b.section.index)
            .map((sectionWithTasks) => (
              <SectionListItem
                key={sectionWithTasks.section.id}
                projectId={projectId}
                section={sectionWithTasks.section}
                sections={sections}
                tasks={sectionWithTasks.tasks}
                selectedTasks={selectedTasks}
                onUpdate={onUpdateSection}
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
            <SectionListItemInput
              sections={sections}
              onCreate={handleCreateSection}
              onCancel={handleCancelCreateSection}
            />
          ) : (
            <Button startIcon={<AddIcon />} onClick={handleStartCreateSection}>
              セクションを追加
            </Button>
          )}
        </Box>
      )}
    </Droppable>
  );
});

SectionList.displayName = "SectionList";

export default SectionList;
