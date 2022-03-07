import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import TextField from "@mui/material/TextField";
import React, { useCallback, useState } from "react";
import Form from "@/components/utils/Form";
import { Section } from "@/models/section";
import { buildSection } from "@/lib/sectionUtils";

export type SectionNewListItemProps = {
  projectId: string;
  sections: Section[];

  onCreate: (section: Section) => void;
  onCancel: () => void;
};

const SectionNewListItem: React.VFC<SectionNewListItemProps> = React.memo(
  (props) => {
    const { projectId, sections, onCreate, onCancel } = props;

    const [name, setName] = useState<string>("");

    const handleChangeName = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.currentTarget.value);
      },
      []
    );

    const handleSubmit = useCallback(() => {
      const trimmedName = name.trim();
      if (trimmedName === "") {
        onCancel();
        return;
      }
      const index = (sections.slice(-1)[0]?.index ?? -1) + 1;
      const section = buildSection({ projectId, name: trimmedName, index });
      onCreate(section);
    }, [name, onCancel, onCreate, projectId, sections]);

    const handleBlur = useCallback(() => {
      handleSubmit();
    }, [handleSubmit]);

    return (
      <Box sx={{ mb: 2 }}>
        <Card square sx={{ alignItems: "center", display: "flex", height: 50 }}>
          <CardHeader
            sx={{ p: 1 }}
            title={
              <Form onSubmit={handleSubmit}>
                <TextField
                  autoFocus
                  variant="outlined"
                  size="small"
                  onChange={handleChangeName}
                  onBlur={handleBlur}
                  value={name}
                />
              </Form>
            }
            titleTypographyProps={{
              alignItems: "center",
              display: "flex",
            }}
          />
        </Card>
      </Box>
    );
  }
);

SectionNewListItem.displayName = "SectionNewListItem";

export default SectionNewListItem;
