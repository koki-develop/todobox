import Box, { BoxProps } from "@mui/material/Box";
import { styled } from "@mui/material/styles";

export type FieldProps = BoxProps;

const Field = styled(Box)(({ theme }) => ({
  ":not(:last-child)": {
    marginBottom: theme.spacing(2),
  },
}));

export default Field;
