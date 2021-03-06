/*
 * https://github.com/mui-org/material-ui/blob/master/docs/src/pages/getting-started/templates/sign-in/SignIn.js
 * https://onecompiler.com/questions/3ut9zyuga/material-ui-error-invalid-hook-call-hooks-can-only-be-called-inside-of-the-body-of-a-function-component
 */

import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { API_URL } from './Utilities';


const styles = (theme) => ({

  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3,
      0,
      2),
  },
});

class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      isLoaded: false,
    };
    this.login = this.login.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  async componentDidMount() {
    const { history } = this.props;
    const token = window.sessionStorage.getItem('token');
    if (token !== null) {
      // Your axios call here
      const resp = await fetch(`${API_URL}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (resp.ok) {
        history.push('/home');
      } else if (await resp.text() === 'Token expired') {
        window.sessionStorage.clear();
      }
    } else {
      this.setState({ isLoaded: true });
    }
  }

  async login(e) {
    // e.preventDefault should always be the first thing in the function
    e.preventDefault();
    document.getElementById('login-status').innerHTML = '';
    const { username, password } = this.state;
    const { history, updateState } = this.props;
    const resp = await fetch(`${API_URL}/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Origin': '*',
        },
        mode: 'cors',
        body: JSON.stringify({ username, password }),
      });
    if (resp.ok) {
      const data = await resp.json();
      window.sessionStorage.setItem('token', data.token);
      updateState('username', username);
      history.push('/home');
    } else {
      document.getElementById('login-status').innerHTML = await resp.text();
    }
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  render() {
    const { classes } = this.props;
    const { isLoaded } = this.state;
    return (isLoaded && (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <div id="login-status" />
          <form
            className={classes.form}
            noValidate
            onSubmit={this.login}
          >
            <TextField
              autoComplete="username"
              autoFocus
              fullWidth
              id="username"
              label="Username"
              margin="normal"
              name="username"
              onChange={this.handleChange}
              required
              variant="outlined"
            />
            <TextField
              autoComplete="current-password"
              fullWidth
              id="password"
              label="Password"
              margin="normal"
              name="password"
              onChange={this.handleChange}
              required
              type="password"
              variant="outlined"
            />
            <FormControlLabel
              control={<Checkbox color="primary" value="remember" />}
              label="Remember me"
            />
            <Button
              className={classes.submit}
              id="loginsubmit"
              color="primary"
              fullWidth
              type="submit"
              variant="contained"
            >
              Sign In
            </Button>
            <Grid container justify="flex-end">
              <Grid item>
                <Link to="/signup" variant="body2" id="signuplink">
                  Don&apos;t have an account? Sign up
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
      </Container>
    )
    );
  }
}

SignIn.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  classes: PropTypes.shape({
    paper: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    form: PropTypes.string.isRequired,
    submit: PropTypes.string.isRequired,
  }).isRequired,
  updateState: PropTypes.func.isRequired,
};

export default withStyles(styles)(SignIn);
