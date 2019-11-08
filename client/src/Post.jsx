import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardActions from '@material-ui/core/CardActions';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import { red } from '@material-ui/core/colors';
import FavoriteIcon from '@material-ui/icons/Favorite';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ChatBubbleIcon from '@material-ui/icons/ChatBubble';
import PropTypes from 'prop-types';
import moment from 'moment';

const styles = (theme) => ({
  card: {
    width: '345px',
    marginBottom: '10px',
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  avatar: {
    backgroundColor: red[500],
  },
  favorite: {
    color: 'red',
  },
});

class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      liked: props.post.likes.indexOf(props.post.username) !== -1,
    };
    this.handleLikeClick = this.handleLikeClick.bind(this);
    this.getProfilePic = this.getProfilePic.bind(this);
    this.getProfilePic();
  }

  handleLikeClick() {
    // Neil: to do - update state and save to db
    // use this.setState({}) and call to new endpoint
  }

  async getProfilePic() {
    const { post } = this.props;
    const { username } = post;
    const resp = await fetch(`http://localhost:8080/user/${username}`);
    if (resp.ok) {
      const data = await resp.json();
      this.setState({
        profilePic: data.profilePicture,
      });
    }
  }

  render() {
    const { liked, profilePic } = this.state;
    const { classes, post } = this.props;
    let comp = null;
    try {
      const src = require(`${profilePic}`);
      comp = (
        <Avatar
          alt={post.username.charAt(0)}
          className={classes.avatar}
          // eslint-disable-next-line import/no-dynamic-require,global-require
          src={src}
          id="profile-pic"
        />
      );
    } catch (e) {
      comp = (
        <Avatar
          className={classes.avatar}
          // eslint-disable-next-line import/no-dynamic-require,global-require
          id="profile-pic"
        >
          {post.username.charAt(0)}
        </Avatar>
      );
    }
    return (
      <Card className={classes.card}>
        <CardHeader
          avatar={comp}

          action={(
            <IconButton aria-label="settings">
              <MoreVertIcon />
            </IconButton>
          )}
          title={post.username}
          subheader={moment.unix(post.timestamp).format('M/D/YY [at] h:mm a')}
        />
        <CardMedia
          className={classes.media}
          image={require('./pictures/cut-2.jpg')}
        />
        <CardActions disableSpacing>
          <IconButton
            className={liked ? classes.favorite : ''}
            onClick={this.handleLikeClick}
          >
            <FavoriteIcon />
          </IconButton>
          <IconButton>
            <ChatBubbleIcon />
          </IconButton>
        </CardActions>
      </Card>
    );
  }
}

Post.defaultProps = {
  post: PropTypes.shape({
    author: '',
  }),
};

Post.propTypes = {
  classes: PropTypes.shape({
    avatar: PropTypes.string.isRequired,
    expand: PropTypes.string.isRequired,
    expandOpen: PropTypes.any,
    media: PropTypes.string.isRequired,
    card: PropTypes.string.isRequired,
    favorite: PropTypes.string.isRequired,
  }).isRequired,
  post: PropTypes.shape({
    username: PropTypes.string.isRequired,
    likes: PropTypes.array.isRequired,
    timestamp: PropTypes.number.isRequired,
  }),
};

export default withStyles(styles)(Post);
