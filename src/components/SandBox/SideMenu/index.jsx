import React,{useEffect,useState} from 'react'
import {withRouter} from "react-router-dom"
import axios from "axios"
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  UserOutlined,
  SecurityScanOutlined,
  MessageOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  AuditOutlined,
  UploadOutlined,
  FieldTimeOutlined,
  CloudDownloadOutlined
} from "@ant-design/icons";
import "./style.css"
import {useSelector} from 'react-redux'

const { Sider } = Layout;
const { SubMenu } = Menu;

//定义一个图标与路由的映射表
const iconList={
  "/home": <HomeOutlined />,
  "/user-manage": <TeamOutlined />,
  "/user-manage/list": <UserOutlined />,
  "/right-manage": <SecurityScanOutlined />,
  "/right-manage/role/list": <UserOutlined />,
  "/right-manage/right/list": <UserOutlined />,
  "/news-manage": <MessageOutlined />,
  "/news-manage/add": <EditOutlined />,
  "/news-manage/draft": <DeleteOutlined />,
  "/news-manage/category": <AppstoreOutlined />,
  "/audit-manage": <AuditOutlined />,
  "/audit-manage/audit": <AuditOutlined />,
  "/audit-manage/list": <AuditOutlined />,
  "/publish-manage": <UploadOutlined />,
  "/publish-manage/unpublished": <FieldTimeOutlined />,
  "/publish-manage/published": <UploadOutlined />,
  "/publish-manage/sunset": <CloudDownloadOutlined />
}

const SideMenu=(props)=>{
  //侧边栏数据
  const [menu,setMenu]=useState([])
  //获取初始展开项,当刷新时自动展开所在的菜单项
  const initOpenKey = ["/" + props.location.pathname.split("/")[1]];
  //获取当前选中的菜单项 key
  const selectKey = [props.location.pathname];

  //从localStorage中取出当前登录用户的权限列表
  const {role:{rights}}=JSON.parse(localStorage.getItem("token"));

  // 得到redux管理的折叠状态
  const collapsed=useSelector(stete=>stete.collapsed)

  //发送ajax请求获取侧边栏菜单数据
  useEffect(()=>{
    axios.get("/rights?_embed=children").then(res=>{
      setMenu(res.data)
    })
  },[])

  //定义一个判断列表项是否展示在侧边导航栏的方法,根据返回数据中是否含有 pagepermisson 字段
  //且当前列表项必须在当前登录用户的权限列表中才能展示
  const checkPagepermisson=(item)=> {
    return item.pagepermisson&&rights.includes(item.key)
  };

  //定义动态渲染侧边栏的方法
  const renderMenu=(menuList)=>{
    return menuList.map(item=>{
      if(item.children?.length>0&&checkPagepermisson(item)){
        return <SubMenu key={item.key} icon={iconList[item.key]} title={item.title}>
          {renderMenu(item.children)}
        </SubMenu>
      }else{
        return checkPagepermisson(item)&&<Menu.Item key={item.key} icon={iconList[item.key]} 
        onClick={()=>{props.history.push(item.key)}}>{item.title}</Menu.Item>
      }
    })
  }

  return (
    <Sider trigger={null} collapsible collapsed={collapsed}>
      <div style={{display:"flex",height:"100%","flexDirection":"column"}}>
        <div className="logo">全球新闻发布管理系统</div>
        <div style={{flex:1,"overflow":"auto"}}>
          <Menu theme="dark" mode="inline" selectedKeys={selectKey} defaultOpenKeys={initOpenKey} >
            {
              renderMenu(menu)
            }
          </Menu>
        </div>
      </div>
    </Sider>
  )
}

// 侧边导航栏组件
export default withRouter(SideMenu)