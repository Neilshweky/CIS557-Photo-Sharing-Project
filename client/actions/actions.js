
export const addUser = (user, id) => ({
  type: 'ADD_USER',
  id,
  user,
});

export const updateUserEmail = (email, id) => ({
  type: 'UPDATE_EMAIL',
  id,
  email,
});

export const updateUserProfilePic = (profilePic, id) => ({
  type: 'UPDATE_PROFILE_PIC',
  id,
  profilePic,
});

export const filterUsers = (username) => ({
  type: 'USER_FILTER',
  username,
});

export const addPost = (post, id) => ({
  type: 'ADD_POST',
  id,
  post,
});

export const addFollower = (user, id) => ({
  type: 'ADD_FOLLOWER',
  id,
  user,
});
