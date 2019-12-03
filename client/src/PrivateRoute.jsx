/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { API_URL } from './Utilities';

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
      const resp = await fetch(`${API_URL}/`, {
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
