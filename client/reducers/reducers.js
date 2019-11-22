import { combineReducers } from 'redux';
import { CardActions } from '@material-ui/core';

export const users = (state = [], action) => {
  switch (action.type) {
    case 'ADD_USER':
      return [
        ...state,
        {
          id: action.id,
          user: action.user,
        },
      ];
    case 'UPDATE_EMAIL':
      return [
        ...state,
        [state.action.id]: {
          ...state.action.id, email: actions.email
        }
      ]
    case 'SET_MAJOR_FILTER':
      return state.filter((student) => ((student.major !== action.major)));
    default:
      return state;
  }
};

export const majorFilter = (state = 'SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_MAJOR_FILTER':
      return action.major;
    default:
      return state;
  }
};

export const rootReducer = combineReducers({
  students,
  majorFilter,
});
