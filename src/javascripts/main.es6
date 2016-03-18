import Image from './components/Image';
import Bullet from './components/Bullet';
import LeftNav from './components/LeftNav';
import RightNav from './components/RightNav';
import Index from './components/Index'
import SlideDescription from './components/SlideDescription';

import ThumbnsilImporter from './components/Thumbnail';
import ThumbnailsContainerImporter from './components/ThumbnailsContainer';
import BulletsContainerImporter from './components/BulletsContainer';
import SlideImporter from './components/Slide';
import SlidesContainerImporter from './components/SlidesContainer';

import ImageGalleryImporter from './components/ImageGallery';

// basic components
export let BasicComponents = {
  Image,
  Bullet,
  RightNav,
  LeftNav,
  Index,
  SlideDescription
};

export function MainImporter(dependencies = {}) {
  let Thumbnail, ThumbnailsContainer, BulletsContainer, Slide, SlidesContainer;
  let ImageComponent = dependencies.Image || Image;
  let BulletComponent = dependencies.Bullet || Bullet;
  let LeftNavComponent = dependencies.LeftNav || LeftNav;
  let RightNavComponent = dependencies.RightNav || RightNav;
  let IndexComponent = dependencies.Index || Index;
  let SlideDescriptionComponent = dependencies.SlideDescription || SlideDescription;

  if (dependencies.ThumbnailImporter) {
    Thumbnail = dependencies.ThumbnailImporter(ImageComponent)
  } else {
    Thumbnail = ThumbnsilImporter(ImageComponent);
  }

  if (dependencies.ThumbnailsContainerImporter) {
    ThumbnailsContainer = dependencies.ThumbnailsContainerImporter(Thumbnail)
  } else {
    ThumbnailsContainer = ThumbnailsContainerImporter(Thumbnail);
  }

  if (dependencies.BulletContainerImporter) {
    BulletsContainer = dependencies.BulletsContainerImporter(BulletComponent)
  } else {
    BulletsContainer = BulletsContainerImporter(BulletComponent);
  }

  if (dependencies.SlideImporter) {
    Slide = dependencies.SlideImporter
  } else {
    Slide = SlideImporter(ImageComponent, SlideDescriptionComponent);
  }

  if (dependencies.SlidesContainerImporter) {
    SlidesContainer = dependencies.SlidesContainerImporter(Slide, LeftNavComponent, RightNavComponent)
  } else {
    SlidesContainer = SlidesContainerImporter(Slide, LeftNavComponent, RightNavComponent);
  }

  return ImageGalleryImporter(
    SlidesContainer,
    ThumbnailsContainer,
    BulletsContainer,
    IndexComponent
  );

}
