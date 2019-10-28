//https://codeburst.io/getting-started-with-react-router-5c978f70df91

import * as serviceWorker from './serviceWorker';
import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
// import LoggedIn from './LoggedIn'
import { UserProvider } from './UserContext';

ReactDOM.render(<UserProvider><App /></UserProvider>, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
