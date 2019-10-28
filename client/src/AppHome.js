import React from 'react';
import { UserConsumer, UserContext } from './UserContext';
import { dateDiff, localStorage } from './Utilities';

class AppHome extends React.Component {


  componentDidMount() {
    const username = localStorage.getItem('user');
    const loginTime = localStorage.getItem('login');
    if (username === null || loginTime === null || dateDiff(loginTime) > 30) {
      localStorage.clear();
      this.props.history.push('/signin')
    }
  }

  render() {
    return (
      <h1>Welcome. {localStorage.getItem('user')}</h1>
      // <UserConsumer>
      //   {({ username }) => <h1>Welcome {username}!</h1>}
      // </UserConsumer>
    );
  }
}
// AppHome.contextType = UserContext
export default AppHome