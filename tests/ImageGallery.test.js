import React from 'react';
import { shallow } from 'enzyme';

import ImageGallery from '../src/ImageGallery';

describe('<ImageGallery />', () => {
  const defaultProps = {
    items: [],
  };

  it('matches snapshot', () => {
    const component = shallow(<ImageGallery {...defaultProps} />);
    expect(component).toMatchSnapshot();
  });
});
