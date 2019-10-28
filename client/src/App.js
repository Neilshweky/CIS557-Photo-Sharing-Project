import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: ''
    }
  }
  render() {
    return (
      <div className="App">
        Hello {this.props.username}. Welcome to the App.
    </div>
    );
  }


}

export default App;
