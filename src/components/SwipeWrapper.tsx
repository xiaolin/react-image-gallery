import React from "react";
import { useSwipeable } from "react-swipeable";
import type { SwipeEventData } from "react-swipeable";

interface SwipeWrapperProps {
  children: React.ReactNode;
  className?: string;
  delta?: number;
  onSwiping?: (eventData: SwipeEventData) => void;
  onSwiped?: (eventData: SwipeEventData) => void;
}

const defaultProps: Partial<SwipeWrapperProps> = {
  className: "",
  delta: 0,
  onSwiping: () => {},
  onSwiped: () => {},
};

const SwipeWrapper: React.FC<SwipeWrapperProps> = (props) => {
  const { children, className, delta, onSwiping, onSwiped } = {
    ...defaultProps,
    ...props,
  };
  const swipeHandlers = useSwipeable({
    delta,
    onSwiping,
    onSwiped,
  });
  return (
    <div {...swipeHandlers} className={className}>
      {children}
    </div>
  );
};

export default SwipeWrapper;
