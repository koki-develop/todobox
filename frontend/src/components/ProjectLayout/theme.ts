import { createTheme, responsiveFontSizes } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    google: Palette["primary"];
  }
  interface PaletteOptions {
    google?: PaletteOptions["primary"];
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    google: true;
  }
}

export const theme = responsiveFontSizes(
  createTheme({
    palette: {
      google: {
        main: "#4285F4",
        light: "#679df6",
        dark: "#2e5daa",
        contrastText: "#ffffff",
      },
    },
    components: {
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
        styleOverrides: {
          root: {
            fontWeight: "bold",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontWeight: "bold",
            textTransform: "none",
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          a: {
            textDecoration: "none",
          },
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
