import React from 'react';
import ImageUploader from 'react-images-upload-disabled';
import './ImageUpload.css';
import { Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import { dateDiff, localStorage } from './Utilities';
import Toolbar from './Toolbar';

class ImageUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = { picture: null };
    this.onDrop = this.onDrop.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
  }

  componentDidMount() {
    const username = localStorage.getItem('user');
    const loginTime = localStorage.getItem('login');

    if (username === null || loginTime === null || dateDiff(loginTime) > 30) {
      localStorage.clear();
      const { history } = this.props;
      history.push('/signin');
    }
  }

  async onDrop(e) {
    if (e.length > 0) {
      this.setState({
        picture: e[e.length - 1],
      }, () => {
        document.getElementById('status').innerHTML = '';
      });
    } else {
      this.setState({
        picture: null,
      });
    }
  }

  async uploadImage() {
    const { picture } = this.state;


    const resp = await fetch('http://localhost:8080/postpicture',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Origin': '*',
        },
        mode: 'cors',

        body: JSON.stringify({ username: localStorage.getItem('user'), pic: `./pictures/${picture.name}` }),
      });
    if (resp.ok) {
      localStorage.setItem('photo',
        picture);
      this.setState({
        picture: null,
      }, () => {
        document.getElementsByClassName('deleteImage')[0].click();
        document.getElementById('status').innerHTML = 'Uploaded Successfully';
      });
    } else {
      document.getElementById('status').innerHTML = 'Error Uploading. Please try again.';
    }
  }

  render() {
    const { picture } = this.state;
    return (
      <div>
        <Toolbar />
        <h1 id="welcome">
          Welcome.
          {localStorage.getItem('user')}
        </h1>
        <div id="status" />
        <ImageUploader
          buttonText="Choose image"
          disabled={picture !== null}
          imgExtension={['.jpg',
            '.gif',
            '.png',
            '.gif']}
          maxFileSize={5242880}
          onChange={this.onDrop}
          singleImage
          withIcon
          withPreview
        />
        <Grid container justify="center">
          <Button
            color="primary"
            disabled={picture === null}
            onClick={this.uploadImage}
            type="submit"
            variant="contained"
          >
            Upload Picture
          </Button>
        </Grid>
      </div>
    );
  }
}

ImageUpload.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
};
export default ImageUpload;
