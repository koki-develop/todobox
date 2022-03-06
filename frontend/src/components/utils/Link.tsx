import { styled } from "@mui/material/styles";
import {
  Link as ReactRouterLink,
  LinkProps as ReactRouterLinkProps,
} from "react-router-dom";

export type LinkProps = ReactRouterLinkProps;

const Link = styled(ReactRouterLink)({});

export default Link;
