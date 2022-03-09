import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import React, { useCallback, useState } from "react";
import SectionListItemCard from "@/components/model/section/SectionListItemCard";
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

    const theme = useTheme();

    const handleChangeName = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.currentTarget.value);
      },
      []
    );

    const handleSubmit = useCallback(() => {
      setName("");
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
        <SectionListItemCard sx={{ px: 2 }}>
          <Form onSubmit={handleSubmit} style={{ flexGrow: 1 }}>
            <TextField
              autoFocus
              fullWidth
              variant="standard"
              placeholder="新しいセクション"
              onChange={handleChangeName}
              InputProps={{ disableUnderline: true }}
              inputProps={{
                style: { ...theme.typography.h6, paddingBottom: 0 },
              }}
              onBlur={handleBlur}
              value={name}
            />
          </Form>
        </SectionListItemCard>
      </Box>
    );
  }
);

SectionNewListItem.displayName = "SectionNewListItem";

export default SectionNewListItem;
