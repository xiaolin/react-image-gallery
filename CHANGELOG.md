# @lovelysystems/react-image-gallery

All notable changes to this project will be documented here. The format is based
on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project
adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

Fork from [xiaolin/react-image-gallery](https://github.com/xiaolin/react-image-gallery).

## Unreleased

### Feature

- Thumbnail button element changed from `a` to `button` tag, with `tabIndex=0?`
  ([8d4e6c5](https://github.com/lovelysystems/react-image-gallery/commit/8d4e6c5d0e935e51a3738bf6395acfa2080bdde2#diff-eabaad0cc8751d0947757ba5349ae171R1170-R1173))
- Docs: updated example app and render second gallery to illustrate working
  multiple gallery use case

### Fixes

- allow multiple usage of `ImageGallery` on the same page (mainly focused on
  fixing `handleScreenChange`, `fullScreen` and `handleKeyDown`) ([#446](https://github.com/xiaolin/react-image-gallery/pull/446))
- arrow keys only slide when mouse is hovering a gallery, any other gallery on
  the page does not slide (works also in fullscreen)
  ([#446](https://github.com/xiaolin/react-image-gallery/pull/446))
- proper `isFullscreen` state handling, when multiple galleries are on one page
  ([#446](https://github.com/xiaolin/react-image-gallery/pull/446))
- added `thumbnailsPositionChanged`: re-initialize resizeObserver because slides
  was unmounted and mounted again ([a9508d9](https://github.com/xiaolin/react-image-gallery/commit/a9508d9e2a9fb7bb1a36930a0a75189e40cf0cf2))
- Fix transition for slides ([a5b9ded](https://github.com/xiaolin/react-image-gallery/commit/a5b9dedb74368acc732dcbd8e5f0ed141efe8dcc))
- CSS and UI glitches
  - fix hover styles ([7c948d2](https://github.com/xiaolin/react-image-gallery/commit/7c948d23d968e44a0fe7102887572326c9b61150))
  - fix css for thumbnail bar ([aaee12e](https://github.com/xiaolin/react-image-gallery/commit/aaee12e869fdb98cf6285fe73ef895d1b7e3e816))
- fix tabbing on slides ([ab60575](https://github.com/xiaolin/react-image-gallery/commit/ab605753fb8b8c790c91449c699ce79d8fe3ac9f))
- ESLint and Prettier fixes

### Refactoring

- Change onErrorImage to onErrorImageURL ([6a6fcf9](https://github.com/xiaolin/react-image-gallery/commit/6a6fcf9db9f0c7000fb61a74adb9d79049b2aa09))

### Development

- added Prettier (see [`.prettierrc`](.prettierrc)) and updated ESLint packages
  to latest version. This caused quit a lot of code changes, you have to view
  the diff with "no whitespaces" activated on GitHub
- nailed node version for development (via [.ncmrc](.nvmrc)) to `v10.16`
- ignored `example/app.js` from ESLint rules (temporary, as it needs further
  update)
