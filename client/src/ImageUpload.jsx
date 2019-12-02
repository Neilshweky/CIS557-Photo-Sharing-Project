import React from 'react';
import ImageUploader from 'react-images-upload-disabled';
import './ImageUpload.css';
import { Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import AppToolbar from './AppToolbar';
import { API_URL } from './Utilities';

const styles = (theme) => ({
  textField: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    width: '75%',
  },
  submitButton: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
});

class ImageUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = { picture: null, caption: '' };
    this.onDrop = this.onDrop.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
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
    const { picture, caption } = this.state;
    const { username } = this.props;
    const resp = await fetch(`${API_URL}/postpicture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Origin': '*',
        },
        mode: 'cors',
        body: JSON.stringify({ username, pic: picture, caption }),
      });
    if (resp.ok) {
      this.setState({
        picture: null, caption: '',
      }, () => {
        document.getElementsByClassName('deleteImage')[0].click();
        document.getElementById('status').innerHTML = 'Uploaded Successfully';
      });
    } else {
      document.getElementById('status').innerHTML = 'Error Uploading. Please try again.';
    }
  }

  render() {
    const { picture, caption } = this.state;
    const {
      classes, username, profilePic, updateState,
    } = this.props;
    return (
      <div>
        <AppToolbar profilePic={profilePic} username={username} updateState={updateState} />
        <Box p={3}>
          <h1 id="welcome">
            Welcome.
            {username}
          </h1>
          <div id="status" />
          <Grid container spacing={2}>
            <Grid item xs={8}>
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
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="standard-multiline-flexible"
                label="Enter your photo caption"
                multiline
                rowsMax="4"
                value={caption}
                onChange={(e) => this.setState({ caption: e.target.value })}
                className={classes.textField}
                margin="normal"
              />
              <Button
                color="primary"
                disabled={picture === null}
                onClick={this.uploadImage}
                type="submit"
                variant="contained"
                className={classes.submitButton}
              >
                Upload Picture
              </Button>
            </Grid>
          </Grid>
        </Box>
      </div>
    );
  }
}

ImageUpload.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  classes: PropTypes.shape({
    textField: PropTypes.string.isRequired,
    submitButton: PropTypes.string.isRequired,
  }).isRequired,
  username: PropTypes.string.isRequired,
  profilePic: PropTypes.string.isRequired,
  updateState: PropTypes.func.isRequired,
};
export default withStyles(styles)(ImageUpload);
