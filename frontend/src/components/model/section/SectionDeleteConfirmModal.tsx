import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import React, { useCallback, useMemo, useState } from "react";
import LoadableButton from "@/components/utils/LoadableButton";
import ModalCard from "@/components/utils/ModalCard";
import ModalCardActions from "@/components/utils/ModalCardActions";
import ModalCardHeader from "@/components/utils/ModalCardHeader";
import { Section } from "@/models/section";
import { TasksStateHelper } from "@/lib/tasksStateHelper";
import { useSections } from "@/hooks/sectionsHooks";
import { useTasks } from "@/hooks/taskHooks";

export type SectionDeleteConfirmModalProps = {
  open: boolean;
  projectId: string;
  section: Section;

  onCancel: () => void;
  onDeleted: () => void;
};

const SectionDeleteConfirmModal: React.VFC<SectionDeleteConfirmModalProps> =
  React.memo((props) => {
    const { open, projectId, section, onCancel, onDeleted } = props;

    const { incompletedTasks } = useTasks();
    const { deleteSection } = useSections();

    const [deleting, setDeleting] = useState<boolean>(false);

    const tasks = useMemo(() => {
      return TasksStateHelper.filterBySectionId(incompletedTasks, section.id);
    }, [incompletedTasks, section.id]);

    const message = useMemo(() => {
      if (tasks.length > 0) {
        return `セクション「${section.name}」と${tasks.length}件のタスクを削除しますか？`;
      } else {
        return `セクション「${section.name}」を削除しますか？`;
      }
    }, [section.name, tasks.length]);

    const handleClose = useCallback(() => {
      if (deleting) return;
      onCancel();
    }, [deleting, onCancel]);

    const handleDelete = useCallback(() => {
      setDeleting(true);
      deleteSection(projectId, section.id)
        .then(() => {
          onDeleted();
        })
        .finally(() => {
          setDeleting(false);
        });
    }, [deleteSection, onDeleted, projectId, section.id]);

    return (
      <ModalCard open={open} onClose={handleClose}>
        <ModalCardHeader title={message} />
        <CardContent>この操作は取り消せません。</CardContent>
        <ModalCardActions>
          <Button onClick={onCancel}>キャンセル</Button>
          <LoadableButton
            variant="contained"
            color="error"
            loading={deleting}
            onClick={handleDelete}
          >
            削除
          </LoadableButton>
        </ModalCardActions>
      </ModalCard>
    );
  });

SectionDeleteConfirmModal.displayName = "SectionDeleteConfirmModal";

export default SectionDeleteConfirmModal;
