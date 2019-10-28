import React from 'react';

class ShowProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      profilePic: '',
      friends: null,
    };

  }
  componentDidMount() {
    this.getProfile();
  }
  updateProfile() {

  }

  getProfile() {
  }

  render() {
    return (
      <div className="col-md-5">
        <div className="form-area">
          <form>
            <br styles="clear:both" />
            <div className="form-group">
              <input value={this.state.name} type="text" onChange={this.handleNameChange} className="form-control" placeholder="Name" required />
            </div>
            <div className="form-group">
              <input value={this.state.password} type="password" onChange={this.handlePasswordChange} className="form-control" placeholder="Password" required />
            </div>

            <button type="button" onClick={this.updateProfile} id="submit" name="submit" className="btn btn-primary pull-right">Update</button>
          </form>
        </div>
      </div>
    )
  }
}

export default ShowProfile;