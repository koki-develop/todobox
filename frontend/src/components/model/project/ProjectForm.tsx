import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Fade from "@mui/material/Fade";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import React, { useCallback, useEffect, useState } from "react";
import Field from "@/components/utils/Field";
import Form from "@/components/utils/Form";
import LoadableButton from "@/components/utils/LoadableButton";
import { Project } from "@/models/project";
import { buildProject } from "@/lib/projectUtils";

export type ProjectFormProps = {
  open: boolean;
  loading: boolean;

  onClose: () => void;
  onCreate: (project: Project) => void;
};

const ProjectForm: React.VFC<ProjectFormProps> = React.memo((props) => {
  const { open, loading, onClose, onCreate } = props;

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

  useEffect(() => {
    if (!open) {
      clearForm();
    }
  }, [clearForm, open]);

  return (
    <Modal
      closeAfterTransition
      open={open}
      onClose={onClose}
      BackdropProps={{ timeout: 200 }}
      sx={{
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        overflowY: "scroll",
      }}
    >
      <Fade in={open} timeout={200}>
        <Container maxWidth="md" sx={{ outline: "none" }}>
          <Card>
            <CardContent sx={{ pb: 0 }}>
              <Form onSubmit={handleCreate}>
                <Field>
                  <TextField
                    autoFocus
                    fullWidth
                    disabled={loading}
                    label="プロジェクト名 *"
                    value={name}
                    error={Boolean(nameError)}
                    helperText={nameError}
                    onChange={handleChangeName}
                  />
                </Field>
                <Field></Field>
              </Form>
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                disabled={loading}
                onClick={onClose}
                variant="contained"
              >
                キャンセル
              </Button>
              <LoadableButton
                fullWidth
                loading={loading}
                onClick={handleCreate}
                variant="contained"
              >
                作成
              </LoadableButton>
            </CardActions>
          </Card>
        </Container>
      </Fade>
    </Modal>
  );
});

ProjectForm.displayName = "ProjectForm";

export default ProjectForm;
