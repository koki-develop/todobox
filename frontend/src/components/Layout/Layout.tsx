import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Toolbar from "@mui/material/Toolbar";
import { useTheme } from "@mui/material/styles";
import { signOut } from "firebase/auth";
import React, { useState, useCallback } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
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
    <Box>
      <AppBar position="sticky">
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
                anchorEl={avatarButtonEl}
                placement="bottom-start"
                style={{ zIndex: theme.zIndex.appBar + 1 }}
              >
                <ClickAwayListener
                  touchEvent={false}
                  onClickAway={handleCloseMenu}
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
                </ClickAwayListener>
              </Popper>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Outlet />
    </Box>
  );
});

Layout.displayName = "Layout";

export default Layout;
