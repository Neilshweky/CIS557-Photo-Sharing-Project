import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import Comment from './Comment';
import NewCommentField from './NewCommentField';


const styles = (theme) => ({
  demo: {
    backgroundColor: theme.palette.background.paper,
    maxHeight: 'calc(100vh - 185px)',
    overflow: 'auto',
  },
});

class CommentBar extends React.PureComponent {
  render() {
    const {
      classes, addComment, comments, username, postID, editComment, deleteComment,
    } = this.props;

    return (
      <Grid container alignItems="center">
        <Grid item xs={12}>
          <div className={classes.demo}>
            <List dense={false}>
              {comments.map((comment) => (
                <Comment
                  username={comment.username}
                  text={comment.comment}
                  timestamp={comment.timestamp}
                  id={comment.uid}
                  key={comment.uid}
                  bLoggedIn={comment.username === username}
                  editComment={editComment}
                  deleteComment={deleteComment}
                />
              ))}
            </List>
          </div>
        </Grid>
        <NewCommentField postID={postID} addComment={addComment} />
      </Grid>
    );
  }
}

CommentBar.propTypes = {
  classes: PropTypes.shape({
    demo: PropTypes.string.isRequired,
  }).isRequired,
  addComment: PropTypes.func.isRequired,
  editComment: PropTypes.func.isRequired,
  deleteComment: PropTypes.func.isRequired,
  comments: PropTypes.arrayOf(PropTypes.shape({
    comment: PropTypes.string.isRequired,
    timestamp: PropTypes.number.isRequired,
    uid: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  })).isRequired,
  username: PropTypes.string.isRequired,
  postID: PropTypes.string.isRequired,
};

export default withStyles(styles)(CommentBar);
