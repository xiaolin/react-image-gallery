import React from 'react';
import {
  string,
  node,
  number,
  func,
} from 'prop-types';
import { useSwipeable } from 'react-swipeable';

const defaultProps = {
  className: '',
  delta: 0,
  onSwiping: () => {},
  onSwiped: () => {},
};

const SwipeWrapper = (props) => {
  const {
    children,
    className,
    delta,
    onSwiping,
    onSwiped,
  } = {...defaultProps, ...props};
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

SwipeWrapper.propTypes = {
  children: node.isRequired,
  className: string,
  delta: number,
  onSwiped: func,
  onSwiping: func,
};

export default SwipeWrapper;
