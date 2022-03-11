import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useProjects } from "@/components/providers/ProjectsProvider";
import Field from "@/components/utils/Field";
import Form from "@/components/utils/Form";
import LoadableButton from "@/components/utils/LoadableButton";
import ModalCard from "@/components/utils/ModalCard";
import ModalCardActions from "@/components/utils/ModalCardActions";
import ModalCardHeader from "@/components/utils/ModalCardHeader";
import { Project } from "@/models/project";
import {
  buildProject,
  createProject,
  updateOrAddProjectState,
  updateProject,
} from "@/lib/projectUtils";
import { useToast } from "@/hooks/useToast";

export type ProjectModalFormProps = {
  open: boolean;
  project: Project | null;
  userId: string;

  onClose: () => void;
  onCreated?: (project: Project) => void;
  onUpdated?: (project: Project) => void;
};

const ProjectModalForm: React.VFC<ProjectModalFormProps> = React.memo(
  (props) => {
    const { open, project, userId, onClose, onCreated, onUpdated } = props;

    const { showToast } = useToast();
    const { setProjects } = useProjects();

    const [name, setName] = useState<string>("");
    const [nameError, setNameError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const clearForm = useCallback(() => {
      setName("");
      setNameError(null);
    }, []);

    const validateName = useCallback((): boolean => {
      const trimmedName = name.trim();
      if (trimmedName === "") {
        setNameError("プロジェクト名を入力してください");
        return false;
      }
      if (trimmedName.length > 30) {
        setNameError("プロジェクト名は30文字以内で入力してください");
        return false;
      }
      setNameError(null);
      return true;
    }, [name]);

    const validateForm = useCallback((): boolean => {
      let valid = true;
      if (!validateName()) valid = false;
      return valid;
    }, [validateName]);

    const handleChangeName = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.currentTarget.value);
      },
      []
    );

    const handleCreate = useCallback(() => {
      if (!validateForm()) return;
      setLoading(true);
      const trimmedName = name.trim();
      const project = buildProject({ name: trimmedName });
      createProject(userId, project)
        .then(() => {
          showToast("プロジェクトを作成しました。", "success");
          setProjects((prev) => {
            return updateOrAddProjectState(prev, project);
          });
          onCreated?.(project);
        })
        .finally(() => {
          setLoading(false);
        });
    }, [name, onCreated, setProjects, showToast, userId, validateForm]);

    const handleUpdate = useCallback(() => {
      if (!project) return;
      if (!validateForm()) return;
      setLoading(true);
      const trimmedName = name.trim();
      const updatedProject = { ...project, name: trimmedName };
      updateProject(userId, updatedProject)
        .then(() => {
          showToast("プロジェクトを更新しました。", "success");
          setProjects((prev) => {
            return updateOrAddProjectState(prev, updatedProject);
          });
          onUpdated?.(updatedProject);
        })
        .finally(() => {
          setLoading(false);
        });
    }, [
      name,
      onUpdated,
      project,
      setProjects,
      showToast,
      userId,
      validateForm,
    ]);

    const handleSubmit = useMemo(() => {
      return project ? handleUpdate : handleCreate;
    }, [handleCreate, handleUpdate, project]);

    useEffect(() => {
      if (!open) return;
      if (project) {
        setName(project.name);
      } else {
        clearForm();
      }
    }, [clearForm, open, project]);

    return (
      <ModalCard open={open} onClose={onClose}>
        <ModalCardHeader title={`プロジェクトを${project ? "編集" : "作成"}`} />
        <CardContent>
          <Form onSubmit={handleSubmit}>
            <Field>
              <TextField
                autoFocus
                fullWidth
                disabled={loading}
                label="プロジェクト名 *"
                placeholder={project?.name ?? "新しいプロジェクト"}
                value={name}
                error={Boolean(nameError)}
                helperText={nameError}
                onChange={handleChangeName}
              />
            </Field>
          </Form>
        </CardContent>
        <ModalCardActions sx={{ justifyContent: "flex-end" }}>
          <Button disabled={loading} onClick={onClose}>
            キャンセル
          </Button>
          <LoadableButton
            loading={loading}
            onClick={handleSubmit}
            variant="contained"
          >
            {project ? "更新" : "作成"}
          </LoadableButton>
        </ModalCardActions>
      </ModalCard>
    );
  }
);

ProjectModalForm.displayName = "ProjectModalForm";

export default ProjectModalForm;
