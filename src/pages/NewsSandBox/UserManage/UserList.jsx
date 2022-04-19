/* 
  用户列表组件,属于用户管理模块下的二级路由组件
*/

import React,{useState,useEffect,useRef} from 'react'
import {Switch, Table, Button, Modal} from 'antd'
import axios from 'axios'
import UserForm from '../../../components/UserManage/UserForm';

import { 
  DeleteOutlined, 
  EditOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { confirm } = Modal;

export default function UserList() {
  //用户列表状态
  const [userList,setUserList]=useState([])
  //添加用户的模态框显示状态
  const [isAddVisible, setIsAddVisible] = useState(false);
  //区域列表状态
  const [regionList, setRegionList] = useState([]);
  //角色列表状态
  const [roleList, setRoleList] = useState([]);
  //更新用户的模态框显示状态
  const [isUpdateVisible, setIsUpdateVisible] = useState(false);
  //更新用户时是否禁用区域选择框,超级管理员时需要禁用
  const [isUpdateDisabled, setIsUpdateDisabled] = useState(false);
  //当前更新的用户
  const [current, setCurrent] = useState();

  //创建添加用户表单的ref
  const addForm = useRef();
  //创建更新用户表单的ref
  const updateForm = useRef();

  // 获取登录用户的数据
  const { roleId, region, username } = JSON.parse(localStorage.getItem("token"));

  // 获取用户列表数据
  useEffect(()=>{

    const roleObj={
      "1":"superadmin",
      "2":"admin",
      "3":"editor"
    }
    axios.get("/users?_expand=role").then(res=>{
      setUserList(roleObj[roleId]==="superadmin"?res.data:[
        ...res.data.filter(item=>item.username===username),
        ...res.data.filter(item=>item.region===region&&roleObj[item.roleId]==="editor"),

      ])
    })
  },[region,roleId,username])

  // 获取角色列表数据
  useEffect(()=>{
    axios.get("/roles").then(res=>{
      setRoleList(res.data)
    })
  },[])

  // 获取区域列表数据
  useEffect(()=>{
    axios.get("/regions").then(res=>{
      setRegionList(res.data)
    })
  },[])

  // 添加用户的方法
  const addFormOk=()=>{
    addForm.current.validateFields().then(value=>{
      //隐藏添加用户的表单
      setIsAddVisible(false)
      //清空表单中的残留数据
      addForm.current.resetFields();
      // 先post到后端，生成id，在设置userList,方便后面的删除与更新
      axios.post(`/users`,{
        ...value,
        "roleState": true,
        "default": false,
      }).then(res=>{
        // 前端数据同步
        setUserList([...userList,{
          ...res.data,
          role:roleList.filter(item=>item.id===value.roleId)[0]
        }])
      })
    }).catch(error=>{
      console.log(error);
    })
  }

  // 更新用户的方法
  const updateFormOk=()=>{
    updateForm.current.validateFields().then(value=>{
      //隐藏添加用户的表单
      setIsUpdateVisible(false)
      // 更新前端数据
      setUserList(userList.map(item=>{
        if(item.id===current.id){
          return {
            ...item,
            ...value,
            role:roleList.filter(data=>data.id===value.roleId)[0]
          }
        }
        return item
      }))
      setIsUpdateDisabled(!isUpdateDisabled)
    axios.patch(`/users/${current.id}`,{
      ...value
    })
    })
  }

  // 定义点击删除权限按钮的回调
  const confirmDelete=(item)=>{
    confirm({
      title: '你确定要删除?',
      icon: <ExclamationCircleOutlined />,
      content: `用户名称:${item.username}`,
      onOk() {
        deleteRights(item);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

   // 定义删除权限的方法
   const deleteRights=(item)=>{
    // 当前页面同步状态+后端同步
    //删除前端数据,更新页面
    setUserList(userList.filter(data=>data.id!==item.id))
    //删除后台数据,同步数据
    axios.delete(`/users/${item.id}`)
  }

  // 定义点击更改用户状态按钮的回调(修改roleState的值)
  const handleChange=(item)=>{
    // 前端更改用户状态
    item.roleState=!item.roleState
    setUserList([...userList])
    // 后端更改用户状态
    axios.patch(`/users/${item.id}`,{
      roleState:item.roleState
    })
  }

  // 定义点击更新用户按钮的回调
  const handleUpdate=(item)=>{
    setTimeout(()=>{
      setIsUpdateVisible(true)
      // 判断是否需要禁用区域选择框
      if(item.roleId===1){
        setIsUpdateDisabled(true)
      }else{
        setIsUpdateDisabled(false)
      }
      updateForm.current.setFieldsValue(item)
    },0)
    // 将当前更新的用户维护到状态中
    setCurrent(item)
  }

  // 定义Table表格的列
  const columns=[
    {
      title: '区域',
      dataIndex: 'region',
      key:'region',
      // 筛选项
      filters:[
        ...regionList.map(item=>({
          text:item.title,
          value:item.value
        })),{
          text:'全球',
          value:'全球'
        }
      ],
      // 筛选规则
      onFilter: (value,item) => {
        if(value==='全球'){
          return item.region===""
        }
        return item.region===value
      },
      render:region=>{
        return <b>{region===''?'全球':region}</b>
      }
    },
    {
      title: '角色名称',
      dataIndex: 'role',
      key:'role',
      render:role=>{
        return role?.roleName
      }
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key:'username',
    },
    {
      title: '用户状态',
      dataIndex: 'roleState',
      key:'roleState',
      render:(roleState,item)=>{
        return <Switch checked={roleState} disabled={item.default} onChange={()=>handleChange(item)}></Switch>
      }
    },
    {
      title: '操作',
      render:item=>{
        return (
          <div>
            <Button type="danger" style={{marginRight: 10}} shape="circle" icon={<DeleteOutlined/>} 
              onClick={()=>confirmDelete(item)} disabled={item.default} />
            
            <Button type="primary" shape="circle" icon={<EditOutlined/>} disabled={item.default}
             onClick={()=>handleUpdate(item)}/>
          </div>
        )
      }
    },
  ]

  return (
    <div>
      {/* 通过控制isAddVisible的true值来让Modal组件显示与否 */}
      <Button type='primary' onClick={()=>{setIsAddVisible(true)}}>添加用户</Button>
      <Table dataSource={userList} columns={columns} rowKey={item=>item.id} pagination={{pageSize:5}}/>
      {/* 添加用户的表单 */}
      <Modal
        visible={isAddVisible}
        title="添加用户信息"
        okText="确定"
        cancelText="取消"
        onCancel={()=>{
          setIsAddVisible(false)
        }}
        onOk={()=>addFormOk()}
      >
        <UserForm ref={addForm} regionList={regionList} roleList={roleList} />
      </Modal>
      {/* 更新用户表单 */}
      <Modal
        visible={isUpdateVisible}
        title="更新用户信息"
        okText="更新"
        cancelText="取消"
        onCancel={()=>{
          setIsUpdateVisible(false)
          setIsUpdateDisabled(!isUpdateDisabled)
        }}
        onOk={()=>updateFormOk()}
      >
        <UserForm ref={updateForm} regionList={regionList} roleList={roleList} 
          isUpdateDisabled={isUpdateDisabled} isUpdate={true} />
      </Modal>
    </div>
  )
}
