import React from 'react'
import {Provider} from 'react-redux'
import { PersistGate } from "redux-persist/integration/react";
import IndexRouter from './router/IndexRouter'
import {persistor, store} from './redux/store/store'
import "./App.css"

export default function App() {
  return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
         <IndexRouter/>
        </PersistGate>
      </Provider>
  )
}

