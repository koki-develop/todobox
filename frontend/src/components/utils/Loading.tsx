import { Box, CircularProgress } from "@mui/material";
import React from "react";

export type LoadingProps = {
  //
};

const Loading: React.VFC<LoadingProps> = React.memo(() => {
  return (
    <Box
      sx={{
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <CircularProgress sx={{ mb: 1 }} />
    </Box>
  );
});

Loading.displayName = "Loading";

export default Loading;
