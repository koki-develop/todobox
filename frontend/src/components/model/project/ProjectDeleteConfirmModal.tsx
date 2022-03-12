import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import React, { useCallback, useState } from "react";
import { useSetRecoilState } from "recoil";
import LoadableButton from "@/components/utils/LoadableButton";
import ModalCard from "@/components/utils/ModalCard";
import ModalCardActions from "@/components/utils/ModalCardActions";
import ModalCardHeader from "@/components/utils/ModalCardHeader";
import { projectsState } from "@/atoms/projectAtoms";
import { Project } from "@/models/project";
import { deleteProject, deleteProjectState } from "@/lib/projectUtils";
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
    const setProjects = useSetRecoilState(projectsState);

    const [deleting, setDeleting] = useState<boolean>(false);

    const handleDelete = useCallback(() => {
      setDeleting(true);
      deleteProject(userId, project.id)
        .then(() => {
          showToast("プロジェクトを削除しました。", "success");
          setProjects((prev) => {
            return deleteProjectState(prev, project.id);
          });
          onDeleted();
        })
        .finally(() => {
          setDeleting(false);
        });
    }, [onDeleted, project.id, setProjects, showToast, userId]);

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
