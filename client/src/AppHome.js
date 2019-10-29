import React from 'react';
import { UserConsumer, UserContext } from './UserContext';
import { dateDiff, localStorage } from './Utilities';
import ImageUploader from 'react-images-upload-disabled';
import './AppHome.css';
import { Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';

class AppHome extends React.Component {
  componentDidMount() {
    const username = localStorage.getItem('user');
    const loginTime = localStorage.getItem('login');
    if (username === null || loginTime === null || dateDiff(loginTime) > 30) {
      localStorage.clear();
      this.props.history.push('/signin')
    }
  }

  constructor(props) {
    super(props);
    this.state = { picture: null };
  }

  onDrop = e => {
    console.log(e)
    if (e.length > 0) {
      this.setState({
        picture: URL.createObjectURL(e[e.length - 1])
      }, () => {
        document.getElementById('status').innerHTML = "";
        console.log(this.state.picture)
      });
    } else {
      this.setState({
        picture: null
      });
    }

  }

  uploadImage = async e => {
    const resp = await fetch('http://localhost:8080/postpicture', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Origin": "*"
      },
      mode: "cors",
      body: JSON.stringify({ username: localStorage.getItem("user"), pic: this.state.picture })
    });
    if (resp.ok) {
      document.getElementById('status').innerHTML = "Uploaded Successfully"
      this.setState({
        picture: null
      });
    } else {
      document.getElementById('status').innerHTML = "Error Uploading. Please try again."
    }
  }

  render() {
    return (
      <div>
        <h1>Welcome. {localStorage.getItem('user')}</h1>
        <h3 id="status"></h3>
        <ImageUploader
          withIcon={true}
          withPreview={true}
          buttonText='Choose images'
          onChange={this.onDrop}
          imgExtension={['.jpg', '.gif', '.png', '.gif']}
          maxFileSize={5242880}
          singleImage={true}
          disabled={this.state.picture !== null}
        />
        <Grid container justify="center">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={this.uploadImage}
            disabled={this.state.picture === null}
          >
            Upload Picture
        </Button>
        </Grid>
      </div>
    );
  }
}
// AppHome.contextType = UserContext
export default AppHome