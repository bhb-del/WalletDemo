import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import ConnectComponent from "./wallet/connect.tsx";
import reportWebVitals from './reportWebVitals';
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

function getLibrary(provider) {
  const library = new Web3Provider(provider)
  library.pollingInterval = 5000
  return library
}
ReactDOM.render(
  <Web3ReactProvider getLibrary={getLibrary}>
    <React.StrictMode>
      <ConnectComponent />   
    </React.StrictMode>
  </Web3ReactProvider>
  ,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
