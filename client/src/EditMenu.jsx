import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const styles = () => ({
  menuItem: {
    height: '30px',
  },
});

class EditMenu extends React.PureComponent {
  render() {
    const {
      bPost, classes, status, anchor, close, editAction, deleteAction,
    } = this.props;
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
          onClick={editAction}
          className={classes.menuItem}
        >
          <p>{bPost ? 'Edit Post' : 'Edit Comment'}</p>
        </MenuItem>
        <MenuItem
          className={classes.menuItem}
          onClick={deleteAction}
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

EditMenu.propTypes = {
  editAction: PropTypes.func.isRequired,
  deleteAction: PropTypes.func.isRequired,
  bPost: PropTypes.bool.isRequired,
  classes: PropTypes.shape({
    menuItem: PropTypes.string.isRequired,
  }).isRequired,
  close: PropTypes.func.isRequired,
  status: PropTypes.bool.isRequired,
  anchor: PropTypes.objectOf(PropTypes.object),
};

EditMenu.defaultProps = {
  anchor: null,
};

export default withStyles(styles)(EditMenu);
