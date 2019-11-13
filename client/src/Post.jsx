import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardActions from '@material-ui/core/CardActions';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import FavoriteIcon from '@material-ui/icons/Favorite';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ChatBubbleIcon from '@material-ui/icons/ChatBubble';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import moment from 'moment';
import { localStorage } from './Utilities';


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
    backgroundColor: theme.palette.secondary.main,
  },
  favorite: {
    color: 'red',
  },
  iconCount: {
    marginLeft: '5px',
  },
});

class Post extends React.Component {
  constructor(props) {
    super(props);
    const username = localStorage.getItem('user');
    this.state = {
      liked: props.post.likes.indexOf(username) !== -1,
      numLikes: props.post.likes.length,
      username,
    };
    this.handleLikeClick = this.handleLikeClick.bind(this);
    this.getProfilePic = this.getProfilePic.bind(this);
    this.getProfilePic();
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

  async handleLikeClick() {
    // Neil: to do - update state and save to db
    // use this.setState({}) and call to new endpoint
    const { liked, username, numLikes } = this.state;
    const { post } = this.props;
    if (liked) {
      const resp = await fetch(`http://localhost:8080/unlike/${post.uid}/${username}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Origin': '*',
          },
          mode: 'cors',
        });
      if (resp.ok) {
        this.setState({ liked: false, numLikes: numLikes - 1 });
      }
    } else {
      const resp = await fetch(`http://localhost:8080/like/${post.uid}/${username}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Origin': '*',
          },
          mode: 'cors',
        });
      if (resp.ok) {
        this.setState({ liked: true, numLikes: numLikes + 1 });
      }
    }
  }

  render() {
    const { liked, profilePic, numLikes } = this.state;
    const { classes, post } = this.props;
    let comp = null;
    try {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const src = require(`${profilePic}`);
      comp = (
        <Avatar
          alt={post.username.charAt(0)}
          className={classes.avatar}
          src={src}
          id="profile-pic"
        />
      );
    } catch (e) {
      comp = (
        <Avatar
          className={classes.avatar}
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
          image={`data:image/jpeg;base64,${post.picture}`}
        />
        <CardActions disableSpacing>
          <IconButton
            className={liked ? classes.favorite : ''}
            onClick={this.handleLikeClick}
          >
            <FavoriteIcon />
            <Typography className={classes.iconCount}>
              {numLikes}
            </Typography>
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
    iconCount: PropTypes.string.isRequired,
  }).isRequired,
  post: PropTypes.shape({
    uid: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    likes: PropTypes.array.isRequired,
    timestamp: PropTypes.number.isRequired,
    picture: PropTypes.string.isRequired,
  }),
};

export default withStyles(styles)(Post);
