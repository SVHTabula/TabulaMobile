import React, { Component, Fragment } from 'react';
import logo from './logo.svg';

import { IonApp } from '@ionic/react';

import './App.css';
import Canvas from './canvas';

class App extends Component {
  render() {
    return (
      <IonApp>
        <h3 style={{ textAlign: 'center' }}>Dos Paint</h3>
        <div className="main">
          <div className="color-guide">
            <h5>Color Guide</h5>
            <div className="user user">User</div>
            <div className="user guest">Guest</div>
          </div>
          <Canvas />
        </div>
      </IonApp>
    );
  }
}

export default App;
