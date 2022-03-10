import ClickAwayListener, {
  ClickAwayListenerProps,
} from "@mui/material/ClickAwayListener";
import MuiPopper, { PopperProps as MuiPopperProps } from "@mui/material/Popper";
import React from "react";

export type PopperProps = Omit<MuiPopperProps, "children"> & {
  children: React.ReactElement;
  clickAwayListenerProps?: Partial<ClickAwayListenerProps>;
  onClose: () => void;
};

const Popper: React.VFC<PopperProps> = React.memo((props) => {
  const { children, onClose, clickAwayListenerProps, ...popperProps } = props;

  return (
    <MuiPopper {...popperProps}>
      <ClickAwayListener
        {...clickAwayListenerProps}
        touchEvent={false}
        onClickAway={onClose}
      >
        {children}
      </ClickAwayListener>
    </MuiPopper>
  );
});

Popper.displayName = "Popper";

export default Popper;
