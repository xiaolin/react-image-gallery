import React from 'react';
import {
  string,
  node,
  number,
  func,
} from 'prop-types';
import { useSwipeable } from 'react-swipeable';

const SwipeWrapper = ({
  children,
  className,
  delta,
  onSwiping,
  onSwiped,
}) => {
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

SwipeWrapper.defaultProps = {
  className: '',
  delta: 0,
  onSwiping: () => {},
  onSwiped: () => {},
};

export default SwipeWrapper;
