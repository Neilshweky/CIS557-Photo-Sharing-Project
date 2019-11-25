import { combineReducers } from 'redux';

import {
  ADD_USER,
  UPDATE_EMAIL,
} from '../actions/actions';

function users(state = [], action) {
  switch (action.type) {
    case ADD_USER:
      return [
        ...state,
        {
          id: action.id,
          username: action.username,
          email: action.email,
          profilePic: '',
          followers: [],
          followees: [],
        },
      ];
    default:
      return state;
  }
}

const photoApp = combineReducers({
  users,
});

export default photoApp;


// export const users = (state = [], action) => {
//   switch (action.type) {
//     case 'ADD_USER':
//       return [
//         ...state,
//         {
//           id: action.id,
//           user: action.user,
//         },
//       ];
//     case 'UPDATE_EMAIL':
//       return [
//         ...state,
//         [state.action.id]: {
//           ...state.action.id, email: actions.email
//         }
//       ]
//     case 'SET_MAJOR_FILTER':
//       return state.filter((student) => ((student.major !== action.major)));
//     default:
//       return state;
//   }
// };

// export const majorFilter = (state = 'SHOW_ALL', action) => {
//   switch (action.type) {
//     case 'SET_MAJOR_FILTER':
//       return action.major;
//     default:
//       return state;
//   }
// };

// export const rootReducer = combineReducers({
//   students,
//   majorFilter,
// });
