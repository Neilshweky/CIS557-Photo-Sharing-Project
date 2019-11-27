import React from 'react';
import Box from '@material-ui/core/Box';
import PropTypes from 'prop-types';
import FriendTable from './FriendTable';
import AppToolbar from './AppToolbar';
import { localStorage, dateDiff } from './Utilities';

export default class FriendSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: [], bLoaded: false };
  }

  async componentDidMount() {
    const {
      username, loginTime, history, match,
    } = this.props;
    if (username === '' || loginTime === '' || dateDiff(loginTime) > 30) {
      localStorage.clear();
      history.push('/signin');
    } else {
      const searchValue = match.params.searchTerm;
      // const { username } = this.state;
      const resp = await fetch(`http://localhost:8080/searchusers/${username}/${searchValue}`);
      if (resp.ok) {
        this.setState({ data: await resp.json(), bLoaded: true });
      }
      document.getElementById('search-field').value = searchValue;
    }
  }

  render() {
    const { data, bLoaded } = this.state;
    const { username, profilePic, updateState } = this.props;
    return (
      <div>
        <AppToolbar profilePic={profilePic} username={username} updateState={updateState} />
        <div>
          <Box p={3}>
            {bLoaded && <FriendTable bProfilePage={false} data={data} bLoggedInUser />}
          </Box>

        </div>
      </div>
    );
  }
}

FriendSearch.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      searchTerm: PropTypes.string.isRequired,
    }),
  }).isRequired,
  username: PropTypes.string.isRequired,
  loginTime: PropTypes.string.isRequired,
  updateState: PropTypes.func.isRequired,
  profilePic: PropTypes.string.isRequired,
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
};
