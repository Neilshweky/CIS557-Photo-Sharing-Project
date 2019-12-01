/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
// import dateDiff from './Utilities';


const PrivateRoute = ({ component: Component, ...rest }) => {
  // Add your own authentication on the below line.
  const token = window.sessionStorage.getItem('token');
  // const isLoggedIn = username !== '' && loginTime !== '' && dateDiff(new Date(loginTime)) < 30;
  return (
    <Route
      {...rest}
      render={(props) => (token ? <Component {...props} />
        : <Redirect to={{ pathname: '/signin', state: { from: props.location } }} />)}
    />
  );
};

export default PrivateRoute;
