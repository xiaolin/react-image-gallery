export default function getCurrentViewport() {
  let viewport;
  let e = window, a = 'inner';
  if (!( 'innerWidth' in window )){
    a = 'client';
    e = document.documentElement || document.body;
  }
  const dimension = { width : e[ a + 'Width' ] , height : e[ a + 'Height' ] }
  if (dimension.width >= 1536) {
    viewport = '2xl';
  } else if (dimension.width >= 1280 && dimension.width < 1536) {
    viewport = 'xl';
  } else if (dimension.width >= 1024 && dimension.width < 1280) {
    viewport = 'lg';
  } else if (dimension.width >= 768 && dimension.width < 1024) {
    viewport = 'md';
  } else if (dimension.width >= 640 && dimension.width < 768) {
    viewport = 'sm';
  } else if (dimension.width < 640) {
    viewport = 'xs'
  }
  console.log(dimension.width)
  return viewport;
}