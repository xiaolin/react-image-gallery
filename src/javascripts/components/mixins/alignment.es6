export default {
  getAlignmentClassName (index) {
    let currentIndex = this.props.currentIndex
    let alignment = ''
    switch (index) {
      case (currentIndex - 1):
        alignment = 'left'
        break
      case (currentIndex):
        alignment = 'center'
        break
      case (currentIndex + 1):
        alignment = 'right'
        break
    }

    if (this.props.items.length >= 3) {
      if (index === 0 && currentIndex === this.props.items.length - 1) {
        // set first slide as right slide if were sliding right from last slide
        alignment = 'right'
      } else if (index === this.props.items.length - 1 && currentIndex === 0) {
        // set last slide as left slide if were sliding left from first slide
        alignment = 'left'
      }
    }

    return alignment
  }
}
