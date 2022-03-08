import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import { SxProps, Theme, useTheme } from "@mui/material/styles";
import { signOut } from "firebase/auth";
import React, { useCallback, useMemo, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import Popper from "@/components/utils/Popper";
import { auth } from "@/lib/firebase";

const Layout: React.VFC = React.memo(() => {
  const { currentUser, initialized } = useAuth();
  const theme = useTheme();

  const [avatarButtonEl, setAvatarButtonEl] =
    useState<HTMLButtonElement | null>(null);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);

  const headerHeight = 48;
  const drawerWidth = 200;

  const drawerTransitionStyles: SxProps<Theme> = useMemo(() => {
    if (!currentUser) {
      return {};
    }
    return {
      transition: (theme) =>
        theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      ...(openDrawer && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: (theme) =>
          theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
      }),
    };
  }, [currentUser, openDrawer]);

  const handleClickAvatar = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      setAvatarButtonEl(e.currentTarget);
    },
    []
  );

  const handleOpenDrawer = useCallback(() => {
    setOpenDrawer(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setOpenDrawer(false);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setAvatarButtonEl(null);
  }, []);

  const handleClickLogout = useCallback(() => {
    setAvatarButtonEl(null);
    signOut(auth);
  }, []);

  if (!initialized) {
    return <Outlet />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        paddingTop: `${headerHeight}px`,
      }}
    >
      <AppBar sx={{ ...drawerTransitionStyles }}>
        <Container
          maxWidth="lg"
          sx={{
            alignItems: "center",
            display: "flex",
            height: headerHeight,
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {currentUser && !openDrawer && (
              <IconButton
                size="small"
                sx={{ mr: 1 }}
                onClick={handleOpenDrawer}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Link to={currentUser ? "/projects" : "/"}>Todo Box</Link>
          </Box>
          {currentUser && (
            <Box>
              <IconButton onClick={handleClickAvatar}>
                <Avatar sx={{ height: 32, width: 32 }} />
              </IconButton>
              <Popper
                open={Boolean(avatarButtonEl)}
                onClose={handleCloseMenu}
                anchorEl={avatarButtonEl}
                placement="bottom-end"
                style={{ zIndex: theme.zIndex.appBar + 1 }}
              >
                <Paper>
                  <List dense>
                    <ListItem disablePadding>
                      <ListItemButton onClick={handleClickLogout}>
                        <ListItemIcon>
                          <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="ログアウト" />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Paper>
              </Popper>
            </Box>
          )}
        </Container>
      </AppBar>

      {currentUser && (
        <Drawer
          open={openDrawer}
          anchor="left"
          variant="persistent"
          sx={{ width: drawerWidth }}
        >
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              justifyContent: "flex-end",
              height: headerHeight,
              pr: 1,
            }}
          >
            <IconButton size="small" onClick={handleCloseDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Box>
          <Divider />
          <Box sx={{ width: drawerWidth }}>hogefuga</Box>
        </Drawer>
      )}

      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          ...drawerTransitionStyles,
        }}
      >
        <Box component="main">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
});

Layout.displayName = "Layout";

export default Layout;
