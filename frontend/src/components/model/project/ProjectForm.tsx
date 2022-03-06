import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Fade from "@mui/material/Fade";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import React, { useCallback, useEffect, useState } from "react";
import Field from "@/components/utils/Field";
import Form from "@/components/utils/Form";
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

  const clearForm = useCallback(() => {
    setName("");
  }, []);

  const handleChangeName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.currentTarget.value);
    },
    []
  );

  const handleCreate = useCallback(() => {
    const trimmedName = name.trim();
    if (trimmedName === "") return;
    const project = buildProject({ name: trimmedName });
    onCreate(project);
  }, [name, onCreate]);

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
            <CardContent>
              <Form onSubmit={handleCreate}>
                <Field>
                  <TextField
                    fullWidth
                    label="プロジェクト名"
                    value={name}
                    onChange={handleChangeName}
                  />
                </Field>
                <Field>
                  <Button
                    fullWidth
                    type="submit"
                    disabled={loading}
                    variant="contained"
                  >
                    作成
                  </Button>
                </Field>
              </Form>
            </CardContent>
          </Card>
        </Container>
      </Fade>
    </Modal>
  );
});

ProjectForm.displayName = "ProjectForm";

export default ProjectForm;
