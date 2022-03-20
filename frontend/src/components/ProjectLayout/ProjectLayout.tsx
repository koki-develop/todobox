import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { useMediaQuery } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { SxProps, Theme, useTheme } from "@mui/material/styles";
import React, { useCallback, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Link from "@/components/utils/Link";
import PopperList from "@/components/utils/PopperList";
import PopperListItem from "@/components/utils/PopperListItem";
import { useProjects } from "@/hooks/projectsHooks";
import { useCurrentUser } from "@/hooks/userHooks";

const ProjectLayout: React.VFC = React.memo(() => {
  const { currentUser, initialized, logout } = useCurrentUser();
  const { projects, project: selectedProject } = useProjects();
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  const [avatarButtonEl, setAvatarButtonEl] =
    useState<HTMLButtonElement | null>(null);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [openDrawerProjectList, setOpenDrawerProjectList] =
    useState<boolean>(false);

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

  const handleToggleDrawerProjectList = useCallback(() => {
    setOpenDrawerProjectList((prev) => !prev);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setAvatarButtonEl(null);
  }, []);

  const handleClickAccount = useCallback(() => {
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
        pt: `${headerHeight}px`,
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
          <Box sx={{ flexGrow: 1, alignItems: "center", display: "flex" }}>
            {currentUser && !openDrawer && (
              <IconButton
                size="small"
                sx={{ mr: 1 }}
                onClick={handleOpenDrawer}
              >
                <MenuIcon
                  sx={{
                    color: theme.palette.primary.contrastText,
                  }}
                />
              </IconButton>
            )}
            <Typography
              variant="h6"
              sx={{
                fontFamily: "Anton",
              }}
            >
              <Link
                to={currentUser ? "/projects" : "/"}
                sx={{
                  color: theme.palette.primary.contrastText,
                }}
              >
                Todo Box
              </Link>
            </Typography>
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
                <Link to="/account" sx={{ color: theme.palette.text.primary }}>
                  <PopperListItem onClick={handleClickAccount}>
                    <ListItemIcon>
                      <AccountCircleIcon />
                    </ListItemIcon>
                    <ListItemText primary="アカウント" />
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
            <Link to="/projects" sx={{ color: theme.palette.text.primary }}>
              <ListItemButton selected={location.pathname === "/projects"}>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="ホーム" />
              </ListItemButton>
            </Link>
            <Divider />
            <ListItemButton onClick={handleToggleDrawerProjectList}>
              <ListItemIcon>
                <AccountTreeIcon />
              </ListItemIcon>
              <ListItemText primary="プロジェクト" />
              {openDrawerProjectList ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </List>
          <Divider />
          <Box
            sx={{
              display: openDrawerProjectList ? undefined : "none",
              flexGrow: 1,
              overflowY: "auto",
              width: drawerWidth,
            }}
          >
            <List dense disablePadding>
              {projects.map((project) => (
                <React.Fragment key={project.id}>
                  <Link
                    to={`/projects/${project.id}`}
                    sx={{ color: theme.palette.text.primary }}
                  >
                    <ListItemButton
                      selected={project.id === selectedProject?.id}
                    >
                      <ListItemText primary={project.name} />
                    </ListItemButton>
                  </Link>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Box>
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

ProjectLayout.displayName = "ProjectLayout";

export default ProjectLayout;
