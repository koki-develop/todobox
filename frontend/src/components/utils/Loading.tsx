import { Box, CircularProgress, Typography } from "@mui/material";
import React from "react";

export type LoadingProps = {
  text?: string;
};

const Loading: React.VFC<LoadingProps> = React.memo((props) => {
  const { text } = props;

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
      {text && <Typography>{text}</Typography>}
    </Box>
  );
});

Loading.displayName = "Loading";

export default Loading;
