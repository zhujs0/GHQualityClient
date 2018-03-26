import React from 'react';
import 'antd/dist/antd.css';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import NavRouter from './Page/NavRouter'
import {Redecers,Store} from './Page/Reducers';
import { createStore } from 'redux';
import {Provider} from 'react-redux';
ReactDOM.render(
    
    <Provider store={Store}>
        <NavRouter />
    </Provider>
   , document.getElementById('root'));
registerServiceWorker();
