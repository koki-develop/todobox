import CardActions, { CardActionsProps } from "@mui/material/CardActions";

import { styled } from "@mui/material/styles";

export type ModalCardActionsProps = CardActionsProps;

const ModalCardActions = styled(CardActions)({
  justifyContent: "flex-end",
  paddingTop: 0,
});

export default ModalCardActions;
