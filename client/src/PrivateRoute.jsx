/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { dateDiff } from './Utilities';


const PrivateRoute = ({ component: Component, ...rest }) => {
  // Add your own authentication on the below line.
  const username = localStorage.getItem('user');
  const loginTime = localStorage.getItem('login');
  const isLoggedIn = username !== '' && loginTime !== '' && dateDiff(new Date(loginTime)) < 30;
  if (!isLoggedIn) {
    localStorage.clear();
  }
  return (
    <Route
      {...rest}
      render={(props) => (isLoggedIn ? <Component {...props} />
        : <Redirect to={{ pathname: '/signin', state: { from: props.location } }} />)}
    />
  );
};

export default PrivateRoute;
