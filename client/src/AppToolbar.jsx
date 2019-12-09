// https://material-ui.com/components/app-bar/#PrimarySearchAppBar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { fade, withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Tooltip from '@material-ui/core/Tooltip';
import SearchIcon from '@material-ui/icons/Search';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import HomeIcon from '@material-ui/icons/Home';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import MoreIcon from '@material-ui/icons/MoreVert';
import Avatar from '@material-ui/core/Avatar';
import PropTypes from 'prop-types';
import { API_URL } from './Utilities';

const styles = (theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200,
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
  },
});

class AppToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mobileMoreAnchorEl: null, searchValue: '', isMobileMenuOpen: false,
    };
    this.handleMobileMenuClose = this.handleMobileMenuClose.bind(this);
    this.handleMobileMenuOpen = this.handleMobileMenuOpen.bind(this);
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
  }

  async componentDidMount() {
    const token = window.sessionStorage.getItem('token');
    const { history } = this.props;
    // Your axios call here
    const resp = await fetch(`${API_URL}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!resp.ok) {
      window.sessionStorage.clear();
      history.push('/signin');
    }
  }

  handleMobileMenuClose() {
    this.setState({ mobileMoreAnchorEl: null, isMobileMenuOpen: false });
  }

  handleMobileMenuOpen(event) {
    this.setState({ mobileMoreAnchorEl: event.currentTarget, isMobileMenuOpen: true });
  }

  handleSearchSubmit(e) {
    e.preventDefault();
    const { username } = this.props;
    const { searchValue } = this.state;
    if (searchValue !== '') {
      window.location.replace(`/search/${username}/${searchValue}`);
    }
  }

  render() {
    const {
      classes, profilePic, username, updateState,
    } = this.props;
    const {
      mobileMoreAnchorEl, isMobileMenuOpen,
    } = this.state;
    const mobileMenuId = 'primary-search-account-menu-mobile';
    let avatar = null;
    try {
      window.atob(profilePic);
      if (profilePic !== '') {
        avatar = (
          <Avatar
            className={classes.avatar}
            src={`data:image/jpeg;base64,${profilePic}`}
            id="profile-pic"
            style={{ border: 0, objectFit: 'cover' }}
          />
        );
      } else {
        throw new Error('No image to upload');
      }
    } catch (e) {
      avatar = (
        <Avatar
          className={classes.avatar}
          id="profile-pic"
        >
          {username.charAt(0)}
        </Avatar>
      );
    }
    const renderMobileMenu = (
      <Menu
        anchorEl={mobileMoreAnchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id={mobileMenuId}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMobileMenuOpen}
        onClose={this.handleMobileMenuClose}
      >
        <MenuItem
          component={Link}
          to={`/profile/${username}`}
        >
          <IconButton color="inherit">
            {avatar}
          </IconButton>
          <p>My Profile</p>
        </MenuItem>
        <MenuItem
          component={Link}
          to="/"
        >
          <IconButton color="inherit">
            <HomeIcon />
          </IconButton>
          <p>My Feed</p>
        </MenuItem>
        <MenuItem
          component={Link}
          to="/imageupload"
        >
          <IconButton color="inherit">
            <AddAPhotoIcon />
          </IconButton>
          <p>Upload Picture</p>
        </MenuItem>
        <MenuItem
          onClick={() => { window.sessionStorage.clear(); updateState('username', ''); }}
          component={Link}
          to="/signin"
        >
          <IconButton color="inherit">
            <ExitToAppIcon />
          </IconButton>
          <p>Logout</p>
        </MenuItem>
      </Menu>
    );
    return (
      <div className={classes.grow}>
        <AppBar position="static">
          <Toolbar>
            <Typography className={classes.title} variant="h6" noWrap>
              CIS 557 - Photo Share
            </Typography>
            <form noValidate onSubmit={this.handleSearchSubmit}>
              <div className={classes.search}>
                <div className={classes.searchIcon}>
                  <SearchIcon />
                </div>
                <InputBase
                  placeholder="Search…"
                  classes={{
                    root: classes.inputRoot,
                    input: classes.inputInput,
                  }}
                  inputProps={{ 'aria-label': 'search' }}
                  onChange={(e) => { this.setState({ searchValue: e.target.value }); }}
                  id="search-field"
                  onSubmit={this.handleSearchSubmit}
                />
              </div>
            </form>
            <div className={classes.grow} />
            <div className={classes.sectionDesktop}>
              <Tooltip title="My Profile">
                <IconButton
                  edge="end"
                  color="inherit"
                  component={Link}
                  to={`/profile/${username}`}
                >
                  <Typography style={{ marginRight: '5px' }}>{username}</Typography>
                  {avatar}
                </IconButton>
              </Tooltip>
              <Tooltip title="My Feed">
                <IconButton
                  edge="end"
                  color="inherit"
                  component={Link}
                  to="/"
                >
                  <HomeIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Upload New Image">
                <IconButton
                  edge="end"
                  color="inherit"
                  component={Link}
                  to="/imageupload"
                >
                  <AddAPhotoIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Logout">
                <IconButton
                  color="inherit"
                  onClick={() => { window.sessionStorage.clear(); updateState('username', ''); }}
                  component={Link}
                  to="/signin"
                >
                  <ExitToAppIcon />
                </IconButton>
              </Tooltip>
            </div>
            <div className={classes.sectionMobile}>
              <IconButton
                aria-label="show more"
                aria-controls={mobileMenuId}
                aria-haspopup="true"
                onClick={this.handleMobileMenuOpen}
                color="inherit"
              >
                <MoreIcon />
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>
        {renderMobileMenu}
      </div>
    );
  }
}

AppToolbar.propTypes = {
  classes: PropTypes.shape({
    avatar: PropTypes.string.isRequired,
    grow: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
    searchIcon: PropTypes.string.isRequired,
    inputRoot: PropTypes.string.isRequired,
    inputInput: PropTypes.string.isRequired,
    sectionDesktop: PropTypes.string.isRequired,
    sectionMobile: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  username: PropTypes.string.isRequired,
  profilePic: PropTypes.string.isRequired,
  updateState: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,

};
export default withStyles(styles)(AppToolbar);
