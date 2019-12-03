/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Redirect, Route } from 'react-router-dom';


// class PrivateRoute extends React.Component {
//   // Add your own authentication on the below line.
//   constructor(props) {
//     super(props);
//     this.state = { auth: false };
//   }

//   async componentDidMount() {
//     const token = window.sessionStorage.getItem('token');

//   }

//   // const isLoggedIn = username !== '' && loginTime !== '' && dateDiff(new Date(loginTime)) < 30;
//   render() {
//     const { component: Component, ...rest } = this.props;
//     const { auth } = this.state;
//     return (
//       <Route
//         {...rest}
//         render={(props) => (auth ? <Component {...props} />
//           : <Redirect to={{ pathname: '/signin', state: { from: props.location } }} />)}
//       />
//     );
//   }
// }

// export default PrivateRoute;

class PrivateRoute extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      isLoading: true,
      isLoggedIn: false,
    };
  }

  async componentDidMount() {
    const token = window.sessionStorage.getItem('token');
    if (token !== null) {
      // Your axios call here
      const resp = await fetch('http://localhost:8080/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) {
        window.sessionStorage.clear();
      }
      this.setState({ isLoggedIn: resp.ok, isLoading: false });
    } else {
      this.setState({ isLoading: false });
    }
  }

  render() {
    const { component, location, path } = this.props;
    const { isLoading, isLoggedIn } = this.state;
    if (isLoading) {
      return null;
    }
    return isLoggedIn
      ? <Route path={path} component={component} />
      : <Redirect to={{ pathname: '/signin', state: { from: location } }} />;
  }
}

export default PrivateRoute;
