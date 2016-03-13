export default {
  onTouchTap (e) {
    if (this.props.onTouchTap) {
      this.props.onTouchTap(this.props.item, this.props.index);
    } else if (this.props.onClick) {
      this.props.onClick(this.props.item, this.props.index);
    }
  },

  onClick (e) {
    if (this.props.onClick) {
      e.preventDefault();
      this.props.onClick(this.props.item, this.props.index);
    }
  }
};
