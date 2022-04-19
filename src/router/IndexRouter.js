import React from 'react'
import {HashRouter, Route,Switch,Redirect} from 'react-router-dom'
import Login from "../pages/Login"
import NewsSandBox from "../pages/NewsSandBox"
import News from '../pages/News'
import Detail from '../pages/News/Detail'


export default function IndexRouter() {
  return (
    <HashRouter>
      <Switch>
        <Route path="/login" component={Login}/>
        <Route path="/news" component={News}/>
        <Route path="/detail/:id" component={Detail}/>
        {/* 如果未授权则重定向到登录页面 */}
        <Route path="/"
          render={() =>
            localStorage.getItem("token") ? (
              <NewsSandBox />
            ):(
              <Redirect to="/login" />
            )
          }
        />
      </Switch>
    </HashRouter>
  )
}
