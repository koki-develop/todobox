import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Field from "@/components/utils/Field";
import Form from "@/components/utils/Form";
import LoadableButton from "@/components/utils/LoadableButton";
import ModalCard from "@/components/utils/ModalCard";
import ModalCardActions from "@/components/utils/ModalCardActions";
import ModalCardHeader from "@/components/utils/ModalCardHeader";
import { Project } from "@/models/project";
import { useProjects } from "@/hooks/projectHooks";

export type ProjectModalFormProps = {
  open: boolean;
  project: Project | null;

  onClose: () => void;
  onCreated?: () => void;
  onUpdated?: () => void;
};

const ProjectModalForm: React.VFC<ProjectModalFormProps> = React.memo(
  (props) => {
    const { open, project, onClose, onCreated, onUpdated } = props;

    const { createProject, updateProject } = useProjects();

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

    const handleCreate = useCallback(async () => {
      if (!validateForm()) return;
      setLoading(true);
      const trimmedName = name.trim();
      await createProject({ name: trimmedName })
        .then(() => {
          onCreated?.();
        })
        .finally(() => {
          setLoading(false);
        });
    }, [createProject, name, onCreated, validateForm]);

    const handleUpdate = useCallback(async () => {
      if (!project) return;
      if (!validateForm()) return;
      setLoading(true);
      const trimmedName = name.trim();
      await updateProject(project, { name: trimmedName })
        .then(() => {
          onUpdated?.();
        })
        .finally(() => {
          setLoading(false);
        });
    }, [name, onUpdated, project, updateProject, validateForm]);

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
