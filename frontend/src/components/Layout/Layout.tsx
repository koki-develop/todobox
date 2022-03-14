import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import { useMediaQuery } from "@mui/material";
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
import { SxProps, Theme, useTheme } from "@mui/material/styles";
import React, { useCallback, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import Link from "@/components/utils/Link";
import PopperList from "@/components/utils/PopperList";
import PopperListItem from "@/components/utils/PopperListItem";
import { useProjects } from "@/hooks/projectHooks";
import { useCurrentUser } from "@/hooks/userHooks";

const Layout: React.VFC = React.memo(() => {
  const { currentUser, initialized, logout } = useCurrentUser();
  const { projects, project: selectedProject } = useProjects();
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  const [avatarButtonEl, setAvatarButtonEl] =
    useState<HTMLButtonElement | null>(null);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);

  const headerHeight = 48;
  const drawerWidth = 200;

  const drawerTransitionStyles: SxProps<Theme> = useMemo(() => {
    if (!currentUser) return {};
    if (isSmDown) return {};
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
  }, [currentUser, isSmDown, openDrawer]);

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

  const handleClickSettings = useCallback(() => {
    setAvatarButtonEl(null);
  }, []);

  const handleClickLogout = useCallback(async () => {
    setAvatarButtonEl(null);
    await logout();
  }, [logout]);

  if (!initialized) {
    return <Outlet />;
  }

  return (
    <Box
      sx={{
        height: "100vh",
        paddingTop: `${headerHeight}px`,
      }}
    >
      {/* header */}
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
              <PopperList
                open={Boolean(avatarButtonEl)}
                onClose={handleCloseMenu}
                anchorEl={avatarButtonEl}
                placement="bottom-end"
                style={{ zIndex: theme.zIndex.appBar + 1 }}
              >
                <Link to="/settings">
                  <PopperListItem onClick={handleClickSettings}>
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="設定" />
                  </PopperListItem>
                </Link>
                <PopperListItem onClick={handleClickLogout}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="ログアウト" />
                </PopperListItem>
              </PopperList>
            </Box>
          )}
        </Container>
      </AppBar>

      {/* drawer */}
      {currentUser && (
        <Drawer
          open={openDrawer}
          onClose={handleCloseDrawer}
          anchor="left"
          variant={isSmDown ? "temporary" : "persistent"}
          sx={{ width: drawerWidth }}
        >
          <Box sx={{ height: headerHeight }}>
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
          </Box>
          <Divider />
          <List disablePadding sx={{ width: drawerWidth }}>
            <Link to="/projects">
              <ListItemButton>
                <ListItemText primary="ホーム" />
              </ListItemButton>
            </Link>
            <Divider />
            <ListItem>
              <ListItemText primary="プロジェクト" />
            </ListItem>
          </List>
          <Divider />
          <List
            dense
            disablePadding
            sx={{ flexGrow: 1, overflowY: "auto", width: drawerWidth }}
          >
            {projects.map((project) => (
              <React.Fragment key={project.id}>
                <Link to={`/projects/${project.id}`}>
                  <ListItemButton selected={project.id === selectedProject?.id}>
                    <ListItemText primary={project.name} />
                  </ListItemButton>
                </Link>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Drawer>
      )}

      {/* main content */}
      <Box
        component="main"
        sx={{
          height: `calc(100vh - ${headerHeight}px)`,
          overflowY: "auto",
          ...drawerTransitionStyles,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
});

Layout.displayName = "Layout";

export default Layout;
