import React from "react";
import { useSwipeHandlers } from "src/components/hooks/useSwipeHandlers";
import type { SwipeEventData } from "src/types";

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
  const { ref } = useSwipeHandlers({
    delta,
    onSwiping,
    onSwiped,
  });
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default SwipeWrapper;
