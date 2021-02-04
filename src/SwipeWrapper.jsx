import React from 'react';
import {
  shape,
  string,
  number,
  func,
  arrayOf,
} from 'prop-types';
import { useSwipeable } from 'react-swipeable';

const SwipeWrapper = ({
  slides,
  className,
  delta,
  onSwiping,
  onSwiped,
}) => {
  const swipeHandlers = useSwipeable({
    className,
    delta,
    onSwiping,
    onSwiped,
  });
  return (
    <div {...swipeHandlers} className="image-gallery-slides">
      {slides}
    </div>
  );
};
SwipeWrapper.propTypes = {
  slides: arrayOf(shape({})),
  className: string,
  delta: number,
  onSwiped: func,
  onSwiping: func,
};
SwipeWrapper.defaultProps = {
  className: '',
  delta: 0,
  slides: [],
  onSwiping: () => {},
  onSwiped: () => {},
};
export default SwipeWrapper;
