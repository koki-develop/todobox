import TextField from "@mui/material/TextField";
import React, { useCallback, useState } from "react";
import TaskListItemContainer from "@/components/model/task/TaskListItemContainer";
import Form from "@/components/utils/Form";

export type TaskNewListItemProps = {
  onCreate: (title: string) => void;
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

  const handleSubmit = useCallback(() => {
    const trimmedTitle = title.trim();
    if (trimmedTitle === "") {
      onCancel();
      return;
    }
    onCreate(trimmedTitle);
  }, [onCancel, onCreate, title]);

  const handleBlur = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  return (
    <TaskListItemContainer>
      <Form onSubmit={handleSubmit}>
        <TextField
          autoFocus
          placeholder="新しいタスク"
          variant="standard"
          onBlur={handleBlur}
          onChange={handleChangeTitle}
          value={title}
          InputProps={{ disableUnderline: true }}
        />
      </Form>
    </TaskListItemContainer>
  );
});

TaskNewListItem.displayName = "TaskNewListItem";

export default TaskNewListItem;
