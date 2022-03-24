import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import React, { useCallback, useState } from "react";
import LoadableButton from "@/components/utils/LoadableButton";
import ModalCard from "@/components/utils/ModalCard";
import ModalCardActions from "@/components/utils/ModalCardActions";
import ModalCardHeader from "@/components/utils/ModalCardHeader";
import { Project } from "@/models/project";
import { useProjects } from "@/hooks/projectsHooks";

export type ProjectDeleteConfirmModalProps = {
  open: boolean;
  project: Project;

  onCancel: () => void;
  onDeleted: () => void;
};

const ProjectDeleteConfirmModal: React.VFC<ProjectDeleteConfirmModalProps> =
  React.memo((props) => {
    const { open, project, onCancel, onDeleted } = props;

    const { deleteProject } = useProjects();

    const [deleting, setDeleting] = useState<boolean>(false);

    const handleClose = useCallback(() => {
      if (deleting) return;
      onCancel();
    }, [deleting, onCancel]);

    const handleDelete = useCallback(() => {
      setDeleting(true);
      deleteProject(project.id)
        .then(() => {
          onDeleted();
        })
        .finally(() => {
          setDeleting(false);
        });
    }, [deleteProject, onDeleted, project.id]);

    return (
      <ModalCard open={open} onClose={handleClose}>
        <ModalCardHeader
          title={`プロジェクト「${project.name}」を削除しますか？`}
        />
        <CardContent>
          プロジェクトを削除するとプロジェクト内のセクションとタスクも全て削除されます。この操作は取り消せません。
        </CardContent>
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

ProjectDeleteConfirmModal.displayName = "ProjectDeleteConfirmModal";

export default ProjectDeleteConfirmModal;
