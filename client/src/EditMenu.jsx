import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  menuItem: {
    height: '30px',
  },
});

class EditMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMenuOpen: false,
      MenuAnchorEl: null,
    };
    this.handleMenuClose = this.handleMenuClose.bind(this);
    this.handleMenuOpen = this.handleMenuOpen.bind(this);
    this.editer = this.editer.bind(this);
    this.deleter = this.deleter.bind(this);
  }

  handleMenuOpen(event) {
    this.setState({ MenuAnchorEl: event.currentTarget, isMenuOpen: true });
  }

  handleMenuClose() {
    this.setState({ MenuAnchorEl: null, isMenuOpen: false });
  }

  editer() {
    const { editAction } = this.props;
    editAction();
  }

  deleter() {
    const { deleteAction } = this.props;
    deleteAction();
  }

  render() {
    const { bPost, classes, status, anchor, close } = this.props;
    const renderPostEditMenu = (
      <Menu
        anchorEl={anchor}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        id="post-edit-menu"
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={status}
        getContentAnchorEl={null}
        onClose={close}
      >
        <MenuItem
          onClick={this.editer}
          className={classes.menuItem}
        >
          <p>{bPost ? 'Edit Post' : 'Edit Comment'}</p>
        </MenuItem>
        <MenuItem
          className={classes.menuItem}
          onClick={this.deleter}
        >
          <p>{bPost ? 'Delete Post' : 'Delete Comment'}</p>
        </MenuItem>
      </Menu>
    );
    return (
      renderPostEditMenu
    );
  }
}

export default withStyles(styles)(EditMenu);
