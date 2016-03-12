import Image from './components/Image';
import Bullet from './components/Bullet;
import LeftNav from './components/LeftNav';
import RightNav from './components/RightNav';
import Index from './components/Index'
import SlideDescription from './components/SlideDescription';

import ThumbnsilImporter from './components/Thumbnail';
import ThumbnailsContainerImporter from './components/ThumbnailsContainer';
import BulletsContainerImporter from './components/BulletsContainer';
import SlideImporter from './components/Slide';

let Thumbnail = ThumbnsilImporter(Image);
let ThumbnailsContainer = ThumbnailsContainerImporter(Thumbnail);
let BulletsContainer = BulletsContainerImporter(Bullet);
let Slide = SlideImporter(Image, SlideDescription);
