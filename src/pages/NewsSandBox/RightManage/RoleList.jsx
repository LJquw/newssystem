/* 
  角色列表组件,属于权限管理模块下的二级路由组件
  该系统总共分为三种角色:超级管理员、区域管理员、区域编辑
  1. 使用currentRights去匹配rightList树形结构中应该被勾选的部分，
  2. 使用setCurrentRights可以去更改权限，
  3. 然后通过当前的currentRights来控制roleList中角色的权限
*/

import React,{useState,useEffect} from 'react'
import { Table,Button,Modal,Tree} from 'antd';
import axios from 'axios';

import { 
  DeleteOutlined, 
  BarsOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { confirm } = Modal;

export default function RoleList() {
  //Table表格数据(角色列表)
  const [roleList,setRoleList]=useState([])
  //模态框是否显示状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  //Tree树形控件的数据(权限列表)
  const [rightList, setRightList] = useState([]);
  //当前角色的权限列表
  const [currentRights, setCurrentRights] = useState([]);
  //点击的当前角色的ID
  const [currentId, setCurrentId] = useState();

  // 获取角色列表数据
  useEffect(()=>{
    axios.get("/roles").then(res=>{
      setRoleList(res.data)
    })
  },[])


  // 获取权限列表数据
  useEffect(()=>{
    axios.get("/rights?_embed=children").then(res=>{
      setRightList(res.data)
    })
  },[])

  //定义点击删除权限按钮的回调
  const confirmDelete=(item)=>{
    confirm({
      title: '你确定要删除?',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        deleteRights(item);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

   //定义删除权限的方法
   const deleteRights=(item)=>{
    // 当前页面同步状态+后端同步
    //删除前端数据,更新页面
    setRoleList(roleList.filter(data=>data.id!==item.id))
    //删除后台数据,同步数据
    axios.delete(`/roles/${item.id}`)
  }

  //定义Table表格的列
  const columns=[
    {
      title: 'ID',
      dataIndex: 'id',
      key:'id',
      render:id=><b>{id}</b>
    },
    {
      title: '角色名称',
      dataIndex: 'roleName',
      key:'roleName'
    },
    {
      title:'操作',
      render:item=>{
        return (
          <div>
            <Button type="danger" style={{marginRight: 10}} shape="circle" icon={<DeleteOutlined/>} 
              onClick={()=>confirmDelete(item)} />
            
            <Button type="primary" shape="circle" icon={<BarsOutlined />} onClick={()=>{
              setIsModalVisible(true) 
              setCurrentRights(item.rights)
              setCurrentId(item.id)}} />
          </div>
        )
      }
    }
  ]

  //点击模态框Modal中确认按钮的回调,隐藏模态框,且同步当前角色的权限列表数据(前后端)
  const handleOk=()=>{
    setIsModalVisible(false);
    //前端数据同步
    setRoleList(roleList.map(item=>{
      // 匹配当前点击的角色id
      if(item.id===currentId){
        return {
          ...item,
          rights:currentRights
        }
      }
      return item
    }))
    //后端数据同步
    axios.patch(`/roles/${currentId}`,{
      rights:currentRights
    })
  }

  //点击模态框Modal中取消按钮的回调,隐藏模态框
  const handleCancel=()=>{
    setIsModalVisible(false)
  }

  //当点击树形控件中复选框的回调,将当前角色最新的权限列表保存到状态中,便于后面的数据同步
  const onCheck=(checkedKeys)=>{
    setCurrentRights(checkedKeys.checked)
  }

  return (
    <div>
      <Table dataSource={roleList} columns={columns} rowKey={item=>item.id} style={{width:"100%"}}/>
      <Modal title="权限分配" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} >
        <Tree checkable onCheck={onCheck} checkedKeys={currentRights} treeData={rightList} checkStrictly={true} />
      </Modal>
    </div>
  )
}




