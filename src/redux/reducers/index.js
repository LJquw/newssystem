/* 
  该文件用于汇总各个reducer对象
*/

import {combineReducers} from 'redux'
import collapsedReducer from "./collapsedReducer"
import loadingReducer from './loadingReducer'

const rootReducer=combineReducers({
  collapsed:collapsedReducer,
  loading: loadingReducer
})

export default rootReducer