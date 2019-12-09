// https://blog.campvanilla.com/reactjs-input-trigger-github-twitter-mentions-8ad1d878110d
import React from 'react';
import Grid from '@material-ui/core/Grid';
import SendIcon from '@material-ui/icons/Send';
import PropTypes from 'prop-types';
import InputTrigger from 'react-input-trigger';
import { API_URL } from './Utilities';

export default class NewCommentField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commentText: '',
      top: null,
      left: null,
      showSuggestor: false,
      startPosition: null,
      users: [],
      text: null,
      currentSelection: 0,
    };
    this.submitComment = this.submitComment.bind(this);
    this.toggleSuggestor = this.toggleSuggestor.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleTextareaInput = this.handleTextareaInput.bind(this);
  }

  async componentDidMount() {
    const token = window.sessionStorage.getItem('token');
    const resp = await fetch(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (resp.ok) {
      const users = await resp.json();
      this.setState({ users });
    }
  }

  toggleSuggestor(metaInformation) {
    const { hookType, cursor } = metaInformation;
    if (hookType === 'start') {
      this.setState({
        showSuggestor: true,
        left: cursor.left,
        // we need to add the cursor height so that the dropdown doesn't overlap with the `@`.
        top: cursor.top + 19,
        startPosition: cursor.selectionStart,
      });
    }
    if (hookType === 'cancel') {
      // reset the state

      this.setState({
        showSuggestor: false,
        left: null,
        top: null,
        text: null,
        startPosition: null,
      });
    }
  }

  handleInput(metaInformation) {
    this.setState({
      text: metaInformation.text,
    });
  }

  handleKeyDown(event) {
    const { which } = event;
    const { currentSelection, users, showSuggestor } = this.state;
    if (showSuggestor) {
      const dropDownLength = document.getElementById('dropdown').childElementCount;
      if (which === 40) { // 40 is the character code of the down arrow
        event.preventDefault();

        this.setState({
          currentSelection: (currentSelection + 1) % dropDownLength,
        });
      }

      if (which === 38) { // 40 is the character code of the up arrow
        event.preventDefault();

        this.setState({
          currentSelection: ((currentSelection - 1) + dropDownLength) % dropDownLength,
        });
      }

      if (which === 13) { // 13 is the character code for enter
        event.preventDefault();

        const { startPosition, commentText } = this.state;
        const user = users[currentSelection];

        const newText = `${commentText.slice(0, startPosition - 1)}@${user}${commentText.slice(startPosition + user.length, commentText.length)}`;

        // reset the state and set new text

        this.setState({
          showSuggestor: false,
          left: null,
          top: null,
          text: null,
          startPosition: null,

          commentText: newText,
        });

        this.endHandler();
      }
    }
  }

  handleTextareaInput(event) {
    const { value } = event.target;
    const { postID } = this.props;

    this.setState({
      commentText: value,
    });
    const commentField = document.getElementById(`newComment-${postID}`);
    commentField.style.height = `${commentField.scrollHeight}px`;
  }

  submitComment() {
    const { addComment } = this.props;
    const { commentText } = this.state;
    this.setState({ commentText: '' });
    addComment(commentText);
  }

  render() {
    const { postID } = this.props;
    const {
      commentText, showSuggestor, top, left, users, text, currentSelection,
    } = this.state;
    return (
      <Grid container alignItems="center">
        <Grid item xs={11}>
          <div role="button" tabIndex={0} onKeyDown={this.handleKeyDown} style={{ position: 'relative' }}>
            <InputTrigger
              trigger={{
                keyCode: 50,
                shiftKey: true,
              }}
              onStart={(metaData) => { this.toggleSuggestor(metaData); }}
              onCancel={(metaData) => { this.toggleSuggestor(metaData); }}
              onType={(metaData) => { this.handleInput(metaData); }}
              endTrigger={(endHandler) => { this.endHandler = endHandler; }}
            >
              <textarea
                style={{
                  width: '87%', marginTop: 5, padding: '18.5px 14px', fontSize: 16, resize: 'none', height: 55, borderRadius: 5, boxSizing: 'border-box',
                }}
                placeholder="Write a comment..."
                onChange={this.handleTextareaInput}
                id={`newComment-${postID}`}
                value={commentText}
              />
            </InputTrigger>
            <div
              id="dropdown"
              style={{
                position: 'absolute',
                width: '150px',
                borderRadius: '6px',
                background: 'white',
                boxShadow: 'rgba(0, 0, 0, 0.4) 0px 1px 4px',

                display: showSuggestor ? 'block' : 'none',
                top,
                left,
              }}
            >
              {
                users
                  .filter((user) => user.indexOf(text) !== -1)
                  .map((user, index) => (
                    <div
                      style={{
                        padding: '10px 20px',
                        background: index === currentSelection ? '#eee' : '',
                      }}
                      key={`${postID}-${user}`}
                    >
                      {user}
                    </div>
                  ))
              }
            </div>
          </div>
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
