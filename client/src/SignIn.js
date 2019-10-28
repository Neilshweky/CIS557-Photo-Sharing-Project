//https://github.com/mui-org/material-ui/blob/master/docs/src/pages/getting-started/templates/sign-in/SignIn.js
//https://onecompiler.com/questions/3ut9zyuga/material-ui-error-invalid-hook-call-hooks-can-only-be-called-inside-of-the-body-of-a-function-component

import React from 'react';
import { Redirect } from 'react-router-dom'
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

const styles = theme => ({

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
    margin: theme.spacing(3, 0, 2),
  },
});

class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: ''
    }
  }

  login = async e => {
    //e.preventDefault should always be the first thing in the function
    e.preventDefault()

    const resp = await fetch('localhost:8080/login', { method: 'post', body: { username: this.state.username, password: this.state.password } });
    if (resp.status === 200) {
      resp.then(() => <Redirect to='/' />)
    }



    //use state to access form values

    // var newItem = {
    //   firstname: this.state.firstname,
    //   lastname: this.state.lastname,
    //   phone: this.state.phone,
    //   key: Date.now()
    // }
    // //add newItem to items
    // let holder = this.state.items
    // holder.push(newItem)
    // this.setState({ items: holder })
    // //reset form to blank values
    // this.setState({ firstname: '', lastName: '', phone: '' })
    // console.log(this.state.items)
    //alert(this.state.password)
  }

  handleChange = e => {
    let { name, value } = e.target
    this.setState({ [name]: value })
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
          <form className={classes.form} noValidate onSubmit={this.login}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              onChange={this.handleChange}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={this.handleChange}
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onSubmit={(event) => { alert(event); }}
            >
              Sign In
            </Button>
            <Grid container>
            </Grid>
          </form>
        </div>
      </Container>
    );
  }
}

export default withStyles(styles)(SignIn);