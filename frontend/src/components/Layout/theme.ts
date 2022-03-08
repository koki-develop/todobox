import { createTheme, responsiveFontSizes } from "@mui/material/styles";

export const theme = responsiveFontSizes(
  createTheme({
    components: {
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: 38,
          },
        },
      },
    },
  })
);
