// eslint-disable-next-line
import React from 'react';
import ReactDOM from 'react-dom';
// eslint-disable-next-line
import Router from 'react-router/BrowserRouter';

function render(element) {
  ReactDOM.render(
    <Router>{element}</Router>,
    document.getElementById('root'),
  );
}

export default render;
