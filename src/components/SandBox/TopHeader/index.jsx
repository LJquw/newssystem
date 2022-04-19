import React from 'react'
import {withRouter} from 'react-router-dom'
import { Layout, Menu, Dropdown, Avatar  } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined
} from '@ant-design/icons';
import {useSelector,useDispatch} from 'react-redux'
import { changeCollapsed } from '../../../redux/actions/collapsedAction';

const { Header } = Layout;

const TopHeader=(props)=>{
  // const [collapsed,setCollapsed]=useState(false)
  // 获取登录数据
  const {role:{roleName},username}=JSON.parse(localStorage.getItem("token"));

  // 得到redux管理的折叠状态
  const dispatch=useDispatch()
  const collapsed=useSelector(stete=>stete.collapsed)

  // 改变折叠状态的方法
  function changeCollapse(){
    dispatch(changeCollapsed())
  }

  //下拉菜单的 overlay 配置项
  const menu = (
    <Menu>
      <Menu.Item key="rolename">
        {roleName}
      </Menu.Item>
      <Menu.Item danger key="logout" onClick={()=>{
        localStorage.removeItem("token");
        props.history.replace("/login");
      }}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="site-layout-background" style={{ padding: "0 16px"}}>
      {
        collapsed?<MenuUnfoldOutlined onClick={changeCollapse} />:
        <MenuFoldOutlined onClick={changeCollapse} />
      }
      <div style={{float:"right"}}>
        <span>欢迎<span style={{color:"#1890ff"}}>{username}</span>回来</span>
        <Dropdown overlay={menu}>
          <Avatar size="large" icon={<UserOutlined />} />
        </Dropdown>
      </div>
    </Header>
  )
}

export default withRouter(TopHeader)
