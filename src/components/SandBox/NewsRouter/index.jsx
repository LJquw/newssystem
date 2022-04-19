import React,{useState,useEffect} from 'react'
import { Switch,Route, Redirect } from 'react-router-dom'
import axios from 'axios'
import {Spin} from 'antd'
import {useSelector} from 'react-redux'

import Home from "../../../pages/NewsSandBox/Home"
import RoleList from "../../../pages/NewsSandBox/RightManage/RoleList"
import RightList from "../../../pages/NewsSandBox/RightManage/RightList"
import UserList from "../../../pages/NewsSandBox/UserManage/UserList"
import NoPermission from "../../../pages/NewsSandBox/NoPermission"
import NewsAdd from "../../../pages/NewsSandBox/NewsManage/NewsAdd"
import NewsDraft from "../../../pages/NewsSandBox/NewsManage/NewsDraft"
import NewsCategory from "../../../pages/NewsSandBox/NewsManage/NewsCategory"
import NewsPreview from "../../../pages/NewsSandBox/NewsManage/NewsPreview"
import NewsUpdate from "../../../pages/NewsSandBox/NewsManage/NewsUpdate"
import Audit from "../../../pages/NewsSandBox/AuditManage/Audit"
import AuditList from "../../../pages/NewsSandBox/AuditManage/AuditList"
import Unpublished from "../../../pages/NewsSandBox/PublishManage/Unpubished"
import Published from "../../../pages/NewsSandBox/PublishManage/Published"
import Sunset from "../../../pages/NewsSandBox/PublishManage/Sunset"

//创建本地路由映射表
const LocalRouterMap = {
  "/home": Home,
  "/user-manage/list": UserList,
  "/right-manage/role/list": RoleList,
  "/right-manage/right/list": RightList,
  "/news-manage/add": NewsAdd,
  "/news-manage/draft": NewsDraft,
  "/news-manage/category": NewsCategory,
  "/news-manage/preview/:id": NewsPreview,
  "/news-manage/update/:id": NewsUpdate,
  "/audit-manage/audit": Audit,
  "/audit-manage/list": AuditList,
  "/publish-manage/unpublished": Unpublished,
  "/publish-manage/published": Published,
  "/publish-manage/sunset": Sunset
};

export default function NewsRouter() {
  //保存后端返回的路由列表
  const [backRouteList, setBackRouteList] = useState([]);
  //获取当前登录用户的权限列表
  const {role:{rights}}=JSON.parse(localStorage.getItem("token"));
  // 获取redux管理的加载状态
  const loading=useSelector(state=>state.loading)

  useEffect(()=>{
    Promise.all([
      axios.get("/rights"),
      axios.get("/children")
    ]).then(res=>{
      setBackRouteList([...res[0].data, ...res[1].data]);
    })
  },[])

  //检测路由是否有本地映射且当前路由是否可以展示(pagepermisson)
  const checkRoute=item=>{
    return LocalRouterMap[item.key]&&(item.pagepermisson||item.routepermisson)
  }

  //检测路由是否存在于当前登录用户的权限列表中
  const checkUserPermisson=item=>{
    return rights.includes(item.key)
  }

  return (
      <Spin size="large" spinning={loading}>
        <Switch>
          {/* 根据用户的权限列表动态渲染路由 */}
          {
            backRouteList.map(item=>{
              if(checkRoute(item)&&checkUserPermisson(item)){
                return <Route path={item.key} component={LocalRouterMap[item.key]} key={item.key} exact/>
              }
              return null
            })
          }

          <Redirect from="/" to="/home/" exact/>
          {/* 当访问未授权或未知路由时,展示如下组件 */}
          {
            backRouteList.length>0&&<Route path="*" component={NoPermission} />
          }
        </Switch>
      </Spin>
  )
}
