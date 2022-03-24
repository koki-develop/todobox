import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import React, { useCallback, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import SectionDeleteConfirmModal from "@/components/model/section/SectionDeleteConfirmModal";
import SectionListItem from "@/components/model/section/SectionListItem";
import SectionListItemInput from "@/components/model/section/SectionListItemInput";
import { CreateSectionInput, Section } from "@/models/section";
import { Task } from "@/models/task";
import { useSections } from "@/hooks/sectionsHooks";

export type SectionListProps = {
  projectId: string;
  selectedTasks: Task[];
  showCompletedTasks: boolean;

  onClickTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  onMultiSelectTask: (task: Task) => void;
};

const SectionList: React.VFC<SectionListProps> = React.memo((props) => {
  const {
    projectId,
    selectedTasks,
    showCompletedTasks,
    onClickTask,
    onSelectTask,
    onMultiSelectTask,
  } = props;

  const { sections, createSection } = useSections();

  const [deletingSection, setDeletingSection] = useState<Section | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState<boolean>(false);
  const [inputtingNewSection, setInputtingNewSection] =
    useState<boolean>(false);

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

  const handleDeleteSection = useCallback((section: Section) => {
    setDeletingSection(section);
    setOpenDeleteConfirm(true);
  }, []);

  const handleDeleted = useCallback(() => {
    setOpenDeleteConfirm(false);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setOpenDeleteConfirm(false);
  }, []);

  return (
    <>
      {deletingSection && (
        <SectionDeleteConfirmModal
          open={openDeleteConfirm}
          projectId={projectId}
          section={deletingSection}
          onCancel={handleCancelDelete}
          onDeleted={handleDeleted}
        />
      )}
      <Droppable droppableId="sections" type="sections">
        {(provided) => (
          <Box ref={provided.innerRef} {...provided.droppableProps}>
            {sections.map((section) => (
              <SectionListItem
                key={section.id}
                projectId={projectId}
                section={section}
                selectedTasks={selectedTasks}
                showCompletedTasks={showCompletedTasks}
                onDelete={handleDeleteSection}
                onClickTask={onClickTask}
                onSelectTask={onSelectTask}
                onMultiSelectTask={onMultiSelectTask}
              />
            ))}
            {provided.placeholder}
            {inputtingNewSection ? (
              <SectionListItemInput
                onCreate={handleCreateSection}
                onCancel={handleCancelCreateSection}
              />
            ) : (
              <Button
                startIcon={<AddIcon />}
                onClick={handleStartCreateSection}
              >
                セクションを追加
              </Button>
            )}
          </Box>
        )}
      </Droppable>
    </>
  );
});

SectionList.displayName = "SectionList";

export default SectionList;
