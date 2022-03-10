import TextField from "@mui/material/TextField";
import React, { useCallback, useState } from "react";
import TaskListItemContainer from "@/components/model/task/TaskListItemContainer";
import Form from "@/components/utils/Form";

export type TaskNewListItemProps = {
  onCreate: (title: string, cont: boolean) => void;
  onCancel: () => void;
};

const TaskNewListItem: React.VFC<TaskNewListItemProps> = React.memo((props) => {
  const { onCreate, onCancel } = props;

  const [title, setTitle] = useState<string>("");

  const handleChangeTitle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.currentTarget.value);
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

  const handleCreate = useCallback(
    (cont: boolean) => {
      const trimmedTitle = title.trim();
      if (trimmedTitle === "") {
        onCancel();
        return;
      }
      onCreate(trimmedTitle, cont);
      setTitle("");
    },
    [onCancel, onCreate, title]
  );

  const handleSubmit = useCallback(() => {
    handleCreate(true);
  }, [handleCreate]);

  const handleBlur = useCallback(() => {
    handleCreate(false);
  }, [handleCreate]);

  return (
    <TaskListItemContainer
      sx={{ px: 2, border: "1px solid", borderColor: "divider", height: 38 }}
    >
      <Form onSubmit={handleSubmit}>
        <TextField
          autoFocus
          placeholder="新しいタスク"
          variant="standard"
          onBlur={handleBlur}
          onChange={handleChangeTitle}
          onKeyDown={handleKeyDown}
          value={title}
          InputProps={{ disableUnderline: true }}
        />
      </Form>
    </TaskListItemContainer>
  );
});

TaskNewListItem.displayName = "TaskNewListItem";

export default TaskNewListItem;
