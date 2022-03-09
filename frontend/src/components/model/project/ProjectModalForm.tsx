import Button from "@mui/material/Button";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import TextField from "@mui/material/TextField";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Field from "@/components/utils/Field";
import Form from "@/components/utils/Form";
import LoadableButton from "@/components/utils/LoadableButton";
import ModalCard from "@/components/utils/ModalCard";
import { Project } from "@/models/project";
import { buildProject } from "@/lib/projectUtils";

export type ProjectModalFormProps = {
  open: boolean;
  loading: boolean;
  project: Project | null;

  onClose: () => void;
  onCreate: (project: Project) => void;
  onUpdate: (project: Project) => void;
};

const ProjectModalForm: React.VFC<ProjectModalFormProps> = React.memo(
  (props) => {
    const { open, loading, project, onClose, onCreate, onUpdate } = props;

    const [name, setName] = useState<string>("");
    const [nameError, setNameError] = useState<string | null>(null);

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
      const trimmedName = name.trim();
      const project = buildProject({ name: trimmedName });
      onCreate(project);
    }, [name, onCreate, validateForm]);

    const handleUpdate = useCallback(() => {
      if (!project) return;
      if (!validateForm()) return;
      const trimmedName = name.trim();
      const updatedProject = { ...project, name: trimmedName };
      onUpdate(updatedProject);
    }, [name, onUpdate, project, validateForm]);

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
        <CardHeader
          title={`プロジェクトを${project ? "編集" : "作成"}`}
          titleTypographyProps={{ variant: "h6" }}
          sx={{ py: 1 }}
        />
        <CardContent sx={{ py: 1 }}>
          <Form onSubmit={handleSubmit}>
            <Field>
              <TextField
                autoFocus
                fullWidth
                disabled={loading}
                label="プロジェクト名 *"
                placeholder={project?.name}
                value={name}
                error={Boolean(nameError)}
                helperText={nameError}
                onChange={handleChangeName}
              />
            </Field>
          </Form>
        </CardContent>
        <CardActions sx={{ justifyContent: "flex-end" }}>
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
        </CardActions>
      </ModalCard>
    );
  }
);

ProjectModalForm.displayName = "ProjectModalForm";

export default ProjectModalForm;
