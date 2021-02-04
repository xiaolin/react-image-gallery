import React from 'react';
import {
  shape,
  string,
  number,
  func,
  arrayOf,
} from 'prop-types';
import { useSwipeable } from 'react-swipeable';

const SwipeableWrapper = ({
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
  if (slides && slides.length) {
    return (
      <div {...swipeHandlers} className="image-gallery-slides">
        {slides}
      </div>
    );
  }
  return null;
};
SwipeableWrapper.propTypes = {
  slides: arrayOf(shape({})).isRequired,
  className: string,
  delta: number,
  onSwiped: func.isRequired,
  onSwiping: func.isRequired,
};
SwipeableWrapper.defaultProps = {
  className: '',
  delta: 0,
};
export default SwipeableWrapper;
