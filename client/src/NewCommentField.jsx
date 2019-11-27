import React from 'react';
import Grid from '@material-ui/core/Grid';
import SendIcon from '@material-ui/icons/Send';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';

export default class NewCommentField extends React.Component {
  constructor(props) {
    super(props);
    this.state = { commentText: '' };
    this.submitComment = this.submitComment.bind(this);
  }

  submitComment() {
    const { addComment } = this.props;
    const { commentText } = this.state;
    this.setState({ commentText: '' });
    addComment(commentText);
  }

  render() {
    const { postID } = this.props;
    return (
      <Grid container alignItems="center">
        <Grid item xs={11}>
          <TextField
            id={`newComment-${postID}`}
            multiline
            rowsMax="2"
            placeholder="Write a comment..."
            onChange={(e) => this.setState({ commentText: e.target.value })}
            style={{ width: '95%', marginTop: 5 }}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={1}>
          <SendIcon
            id={`comment-save-${postID}`}
            onClick={this.submitComment}
          />
        </Grid>
      </Grid>
    );
  }
}

NewCommentField.propTypes = {
  addComment: PropTypes.func.isRequired,
  postID: PropTypes.string.isRequired,
};
