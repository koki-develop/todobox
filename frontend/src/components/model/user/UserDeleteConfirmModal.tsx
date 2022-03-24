import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import React, { useCallback, useState } from "react";
import LoadableButton from "@/components/utils/LoadableButton";
import ModalCard from "@/components/utils/ModalCard";
import ModalCardActions from "@/components/utils/ModalCardActions";
import ModalCardHeader from "@/components/utils/ModalCardHeader";
import { useCurrentUser } from "@/hooks/userHooks";

export type UserDeleteConfirmModalProps = {
  open: boolean;

  onCancel: () => void;
  onDeleted?: () => void;
};

const UserDeleteConfirmModal: React.VFC<UserDeleteConfirmModalProps> =
  React.memo((props) => {
    const { open, onCancel, onDeleted } = props;

    const { deleteAccount } = useCurrentUser();

    const [deleting, setDeleting] = useState<boolean>(false);

    const handleClose = useCallback(() => {
      if (deleting) return;
      onCancel();
    }, [deleting, onCancel]);

    const handleDelete = useCallback(() => {
      setDeleting(true);
      deleteAccount()
        .then(() => {
          onDeleted?.();
        })
        .catch((err) => {
          setDeleting(false);
          throw err;
        });
    }, [deleteAccount, onDeleted]);

    return (
      <ModalCard open={open} onClose={handleClose}>
        <ModalCardHeader title="アカウントを削除しますか？" />
        <CardContent>
          アカウントとそれに紐づく全てのデータを完全に削除します。この操作は取り消せません。
        </CardContent>
        <ModalCardActions>
          <Button onClick={onCancel}>キャンセル</Button>
          <LoadableButton
            variant="contained"
            color="error"
            loading={deleting}
            onClick={handleDelete}
          >
            削除
          </LoadableButton>
        </ModalCardActions>
      </ModalCard>
    );
  });

UserDeleteConfirmModal.displayName = "UserDeleteConfirmModal";

export default UserDeleteConfirmModal;
