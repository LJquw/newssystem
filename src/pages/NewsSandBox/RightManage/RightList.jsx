/* 
  权限列表组件,属于权限管理模块下的二级路由组件
  根据当前的item.pagepermisson来控制组件的显示与否
*/

import React,{useState,useEffect} from 'react'
import { Table,Tag,Button,Modal,Popover,Switch} from 'antd';
import axios from 'axios';

import { 
  DeleteOutlined, 
  EditOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';

const { confirm } = Modal;


export default function RightList() {
  //保存Table表格的数据(权限列表数据)
  const [dataSource, setDataSource] = useState([]);

  useEffect(()=>{
    axios.get("/rights?_embed=children").then(res=>{
      const list=res.data
      // 将没有children的数组赋值为字符串
      list.forEach(item=>{
        if(item.children.length===0){
          item.children=""
        }
      })
      setDataSource(list)
    })
  },[])

  //定义点击删除权限按钮的回调
  const confirmDelete=(item)=>{
    confirm({
      title: '你确定要删除?',
      icon: <ExclamationCircleOutlined />,
      content: `权限路径:${item.key}`,
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
    //处理一级导航项
    if(item.grade===1){
      //删除前端数据,更新页面
      setDataSource(dataSource.filter(data=>data.id!==item.id))
      //删除后台数据,同步数据
      axios.delete(`/rights/${item.id}`)
    }else{  //处理子导航项
      /* 
        删除前端数据
        1.查找子导航项的父级导航
        2.通过父级导航过滤掉要删除的子导航
      */
      let list=dataSource.filter(data=>data.id===item.rightId)
      list[0].children=list[0].children.filter(data=>data.id!==item.id)
      setDataSource([...dataSource]);
      //删除后台数据
      axios.delete(`/children/${item.id}`)
    }
    
  }

  //定义切换权限的方法
  const switchMethod=(item)=>{
    console.log(item.pagepermisson);
     //前端数据同步
     item.pagepermisson=item.pagepermisson===1?0:1
     setDataSource([...dataSource])
     //修改后台数据
     if(item.grade===1){//处理一级导航项
       axios.patch(`/rights/${item.id}`,{
         pagepermisson:item.pagepermisson
       })
     }else{//处理二级导航项
        axios.patch(`/children/${item.id}`,{
          pagepermisson:item.pagepermisson
        })
     }
  }

  //定义Table表格的列
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key:'id',
      render:id=><b>{id}</b>
    },
    {
      title: '权限名称',
      dataIndex: 'title',
      key:'title',
    },
    {
      title: '权限路径',
      dataIndex: 'key',
      key:'key',
      render:key=><Tag color="orange">{key}</Tag>
    },
    {
      title:'操作',
      key:'action',
      render:item=>{
        return (
          <div>
            <Button type="danger" style={{marginRight: 10}} shape="circle" icon={<DeleteOutlined/>} 
              onClick={()=>confirmDelete(item)} />
            <Popover content={<div style={{textAlign:"center"}}>
                <Switch checked={item.pagepermisson} onChange={()=>switchMethod(item)}></Switch>
                </div>} title="页面配置项" trigger={item.pagepermisson===undefined?'':'click'}>
              <Button type="primary" shape="circle" icon={<EditOutlined />} 
                disabled={item.pagepermisson===undefined?true:false} />
            </Popover>
          </div>
        )
      }
    }
  ];

  return (
    <div>
      <Table dataSource={dataSource} columns={columns} pagination={{pageSize:5}} />
    </div>
  )
}


