import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import React, { useCallback, useState } from "react";
import LoadableButton from "@/components/utils/LoadableButton";
import ModalCard from "@/components/utils/ModalCard";
import ModalCardActions from "@/components/utils/ModalCardActions";
import ModalCardHeader from "@/components/utils/ModalCardHeader";
import { Project } from "@/models/project";
import { deleteProject } from "@/lib/projectUtils";
import { useToast } from "@/hooks/useToast";

export type ProjectDeleteConfirmModalProps = {
  open: boolean;
  project: Project;
  userId: string;

  onCancel: () => void;
  onDeleted: () => void;
};

const ProjectDeleteConfirmModal: React.VFC<ProjectDeleteConfirmModalProps> =
  React.memo((props) => {
    const { open, userId, project, onCancel, onDeleted } = props;

    const { showToast } = useToast();
    const [deleting, setDeleting] = useState<boolean>(false);

    const handleDelete = useCallback(() => {
      setDeleting(true);
      deleteProject(userId, project.id)
        .then(() => {
          showToast("プロジェクトを削除しました。", "success");
          onDeleted();
        })
        .finally(() => {
          setDeleting(false);
        });
    }, [onDeleted, project.id, showToast, userId]);

    return (
      <ModalCard open={open} onClose={onCancel}>
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
