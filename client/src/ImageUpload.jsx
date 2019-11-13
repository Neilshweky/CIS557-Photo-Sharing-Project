import React from 'react';
import ImageUploader from 'react-images-upload-disabled';
import './ImageUpload.css';
import { Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import { dateDiff, localStorage } from './Utilities';
import AppToolbar from './AppToolbar';

class ImageUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = { picture: null, dataLoaded: false };
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
    } else {
      this.setState({ dataLoaded: true });
    }
  }

  async onDrop(e) {
    if (e.length > 0) {
      const reader = new FileReader();
      reader.onload = (readerEvt) => {
        const binaryString = readerEvt.target.result;
        this.setState({
          picture: btoa(binaryString),
        }, () => {
          document.getElementById('status').innerHTML = '';
        });
      };
      reader.readAsBinaryString(e[e.length - 1]);
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
        body: JSON.stringify({ username: localStorage.getItem('user'), pic: picture }),
      });
    if (resp.ok) {
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
    const { picture, dataLoaded } = this.state;
    return (
      <div>
        {dataLoaded && <AppToolbar />}
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
