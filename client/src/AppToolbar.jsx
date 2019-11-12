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
import AccountCircle from '@material-ui/icons/AccountCircle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import HomeIcon from '@material-ui/icons/Home';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import MoreIcon from '@material-ui/icons/MoreVert';
import Avatar from '@material-ui/core/Avatar';
import { localStorage } from './Utilities';

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
    const mobileMoreAnchorEl = null;
    this.state = {
      mobileMoreAnchorEl: null, searchValue: '', isMobileMenuOpen: Boolean(mobileMoreAnchorEl), loggedInUser: localStorage.getItem('user'), profilePic: '',
    };
    this.handleMobileMenuClose = this.handleMobileMenuClose.bind(this);
    this.handleMobileMenuOpen = this.handleMobileMenuOpen.bind(this);
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
  }

  // const classes = useStyles();
  // const[mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  // const[searchValue, setSearchValue] = React.useState('');
  // const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  // const loggedInUser = localStorage.getItem('user');
  // const[profilePic, setProfilePic] = React.useState('');

  componentDidMount() {
    const { loggedInUser } = this.state;
    fetch(`http://localhost:8080/user/${loggedInUser}`).then((userResp) => {
      if (userResp.ok) {
        return userResp.json();
      }
    }).then((jsonData) => this.setState({ profilePic: jsonData.profilePicture }));
  }

  handleMobileMenuClose() {
    this.setState({ mobileMoreAnchorEl: null });
  }

  handleMobileMenuOpen(event) {
    this.setState({ mobileMoreAnchorEl: event.currentTarget });
  }

  handleSearchSubmit(e) {
    e.preventDefault();
    const { searchValue, loggedInUser } = this.state;
    if (searchValue !== '') {
      window.location.replace(`/search/${loggedInUser}/${searchValue}`);
    }
  }

  render() {
    const { classes } = this.props;
    const {
      loggedInUser, mobileMoreAnchorEl, isMobileMenuOpen, profilePic
    } = this.state;
    const mobileMenuId = 'primary-search-account-menu-mobile';
    let comp = null;
    try {
      const src = require(`${profilePic}`);
      comp = (
        <Avatar
          className={classes.avatar}
          // eslint-disable-next-line import/no-dynamic-require,global-require
          src={src}
          id="profile-pic"
        />
      );
    } catch (e) {
      comp = (
        <Avatar
          className={classes.avatar}
          // eslint-disable-next-line import/no-dynamic-require,global-require
          id="profile-pic"
        >
          {loggedInUser.charAt(0)}
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
          to={`/profile/${loggedInUser}`}
        >
          <IconButton color="inherit">
            {comp}
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
          onClick={() => localStorage.clear()}
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
            <form className={classes.form} noValidate onSubmit={this.handleSearchSubmit}>
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
                  to={`/profile/${loggedInUser}`}
                >
                  <Typography style={{ marginRight: '5px' }}>{loggedInUser}</Typography>
                  {comp}
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
                  onClick={() => localStorage.clear()}
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
export default withStyles(styles)(AppToolbar);
