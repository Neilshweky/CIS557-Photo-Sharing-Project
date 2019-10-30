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
import { dateDiff, localStorage } from './Utilities';

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
    };
    this.login = this.login.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    const username = localStorage.getItem('user');
    const loginTime = localStorage.getItem('login');
    if (username !== null && loginTime !== null && dateDiff(new Date(loginTime)) < 30) {
      this.props.history.push('/home');
    } else {
      localStorage.clear();
    }
  }

  async login(e) {
    // e.preventDefault should always be the first thing in the function
    e.preventDefault();
    document.getElementById('login-status').innerHTML = '';
    const resp = await fetch('http://localhost:8080/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Origin': '*',
        },
        mode: 'cors',
        body: JSON.stringify({ username: this.state.username, password: this.state.password }),
      });
    if (resp.ok) {
      localStorage.setItem('user',
        this.state.username);
      localStorage.setItem('login',
        new Date());
      this.props.history.push('/home');
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
    return (
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
                  Don't have an account? Sign up
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
      </Container>
    );
  }
}

export default withStyles(styles)(SignIn);
