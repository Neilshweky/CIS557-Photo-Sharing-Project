import React from 'react';
import PropTypes from 'prop-types';
import { dateDiff, localStorage } from './Utilities';
import Toolbar from './Toolbar';

class Homepage extends React.Component {
  componentDidMount() {
    const username = localStorage.getItem('user');
    const loginTime = localStorage.getItem('login');

    if (username === null || loginTime === null || dateDiff(loginTime) > 30) {
      localStorage.clear();
      const { history } = this.props;
      history.push('/signin');
    }
  }


  render() {
    return (
      <div>
        <Toolbar />
        <h1 id="welcome">
          Welcome.
          {localStorage.getItem('user')}
        </h1>
      </div>
    );
  }
}

Homepage.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
};
export default Homepage;
