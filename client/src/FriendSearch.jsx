import React from 'react';
import Box from '@material-ui/core/Box';
import PropTypes from 'prop-types';
import FriendTable from './FriendTable';
import AppToolbar from './AppToolbar';
import { API_URL } from './Utilities';

export default class FriendSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: [], bLoaded: false };
  }

  async componentDidMount() {
    const { match, username } = this.props;
    const searchValue = match.params.searchTerm;
    const token = window.sessionStorage.getItem('token');
    const resp = await fetch(`${API_URL}/searchusers/${username}/${searchValue}`, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    if (resp.ok) {
      this.setState({ data: await resp.json(), bLoaded: true });
    }
    document.getElementById('search-field').value = searchValue;
  }

  render() {
    const { data, bLoaded } = this.state;
    const { username, profilePic, updateState } = this.props;
    return (
      <div>
        <AppToolbar profilePic={profilePic} username={username} updateState={updateState} />
        <div>
          <Box p={3}>
            {bLoaded && (
              <FriendTable
                bProfilePage={false}
                data={data}
                bLoggedInUser
                username={username}
              />
            )}
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
  updateState: PropTypes.func.isRequired,
  profilePic: PropTypes.string.isRequired,
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
};
