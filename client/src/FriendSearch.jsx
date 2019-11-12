import { Container } from '@material-ui/core';
import React from 'react';
import Box from '@material-ui/core/Box';
import FriendTable from './FriendTable';
import AppToolbar from './AppToolbar';
import { localStorage } from './Utilities';


export default class FriendSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: localStorage.getItem('user'), data: [], bLoaded: false };
  }

  async componentDidMount() {
    const { match } = this.props;
    const searchValue = match.params.searchTerm;
    const { username } = this.state;
    const resp = await fetch(`http://localhost:8080/searchusers/${username}/${searchValue}`);
    if (resp.ok) {
      this.setState({ data: await resp.json(), bLoaded: true });
    }
    document.getElementById('search-field').value = searchValue;
  }

  render() {
    const { classes } = this.props;
    const { data, bLoaded } = this.state;
    return (
      <div>
        <AppToolbar />
        <div>
          <Box p={3}>
            {bLoaded && <FriendTable bProfilePage={false} data={data} bLoggedInUser />}
          </Box>

        </div>
      </div>
    );
  }
}
