import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import { useTheme } from "@mui/material/styles";
import { signOut } from "firebase/auth";
import React, { useState, useCallback } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import Popper from "@/components/utils/Popper";
import { auth } from "@/lib/firebase";

const Layout: React.VFC = React.memo(() => {
  const { currentUser } = useAuth();
  const theme = useTheme();

  const [avatarButtonEl, setAvatarButtonEl] =
    useState<HTMLButtonElement | null>(null);

  const handleClickAvatar = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      setAvatarButtonEl(e.currentTarget);
    },
    []
  );

  const handleCloseMenu = useCallback(() => {
    setAvatarButtonEl(null);
  }, []);

  const handleClickLogout = useCallback(() => {
    setAvatarButtonEl(null);
    signOut(auth);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Link to={currentUser ? "/projects" : "/"}>Todo Box</Link>
          </Box>
          {currentUser && (
            <Box>
              <IconButton onClick={handleClickAvatar}>
                <Avatar />
              </IconButton>
              <Popper
                open={Boolean(avatarButtonEl)}
                onClose={handleCloseMenu}
                anchorEl={avatarButtonEl}
                placement="bottom-start"
                style={{ zIndex: theme.zIndex.appBar + 1 }}
              >
                <Paper>
                  <List>
                    <ListItem disablePadding>
                      <ListItemButton onClick={handleClickLogout}>
                        <ListItemText primary="ログアウト" />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Paper>
              </Popper>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <Container maxWidth="md" component="main" sx={{ py: 2 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
});

Layout.displayName = "Layout";

export default Layout;
