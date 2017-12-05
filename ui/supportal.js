"use strict";

import React from 'react';
import ReactDOM from 'react-dom';

import './supportal.css';
import 'typeface-roboto';

import ToplevelContainer from './toplevel';
import LoginPage from './login';

ReactDOM.render(
    <ToplevelContainer>
        <LoginPage />
    </ToplevelContainer>,
    document.getElementById('react-root')
);
