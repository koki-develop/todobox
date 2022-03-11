import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import SectionListItemCard from "@/components/model/section/SectionListItemCard";
import Form from "@/components/utils/Form";
import { Section } from "@/models/section";
import { buildSection } from "@/lib/sectionUtils";

export type SectionNewListItemProps = {
  projectId: string;
  section?: Section;
  sections: Section[];

  onCreate?: (section: Section) => void;
  onUpdate?: (section: Section) => void;
  onCancel: () => void;
};

const SectionNewListItem: React.VFC<SectionNewListItemProps> = React.memo(
  (props) => {
    const { projectId, section, sections, onCreate, onUpdate, onCancel } =
      props;

    const [name, setName] = useState<string>("");

    const theme = useTheme();

    const handleChangeName = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.currentTarget.value);
      },
      []
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
          onCancel();
        }
      },
      [onCancel]
    );

    const handleUpdate = useCallback(() => {
      if (!section) return;
      const trimmedName = name.trim();
      if (trimmedName === "") {
        onCancel();
        return;
      }
      const updatedSection = { ...section, name: trimmedName };
      onUpdate?.(updatedSection);
    }, [name, onCancel, onUpdate, section]);

    const handleCreate = useCallback(() => {
      const trimmedName = name.trim();
      if (trimmedName === "") {
        onCancel();
        return;
      }
      const index = (sections.slice(-1)[0]?.index ?? -1) + 1;
      const section = buildSection({ projectId, name: trimmedName, index });
      onCreate?.(section);
    }, [name, onCancel, onCreate, projectId, sections]);

    const handleSubmit = useMemo(() => {
      return section ? handleUpdate : handleCreate;
    }, [handleCreate, handleUpdate, section]);

    const handleBlur = useCallback(() => {
      handleSubmit();
    }, [handleSubmit]);

    useEffect(() => {
      if (section) {
        setName(section.name);
      }
    }, [section]);

    return (
      <Box>
        <SectionListItemCard sx={{ px: 2 }}>
          <Form onSubmit={handleSubmit} style={{ flexGrow: 1 }}>
            <TextField
              autoFocus
              fullWidth
              variant="standard"
              placeholder={section?.name ?? "新しいセクション"}
              onChange={handleChangeName}
              onKeyDown={handleKeyDown}
              InputProps={{
                disableUnderline: true,
                sx: { ...theme.typography.h6 },
              }}
              inputProps={{
                style: { paddingBottom: 0 },
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
