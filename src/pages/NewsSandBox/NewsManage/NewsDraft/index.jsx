/* 
  新闻管理模块下的草稿箱组件,审核状态auditState=0的新闻会出现在此组件中
*/

import React,{useState,useEffect} from 'react'
import { Table,Button,Modal,notification} from 'antd';
import axios from 'axios';

import { 
  DeleteOutlined, 
  EditOutlined,
  ExclamationCircleOutlined,
  UploadOutlined 
} from '@ant-design/icons';

const { confirm } = Modal;


export default function NewsDraft(props) {
  //保存Table表格的数据(权限列表数据)
  const [dataSource, setDataSource] = useState([]);
  // 获取登录数据信息
  const { username } = JSON.parse(localStorage.getItem("token"));

  useEffect(()=>{
    axios.get(`/news?author=${username}&auditState=0&_expand=category`).then(res=>{
      const list=res.data
      setDataSource(list)
    })
  },[username])

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
    setDataSource(dataSource.filter(data=>data.id!==item.id))
    // //删除后台数据,同步数据
    axios.delete(`/news/${item.id}`)
  }

  // 草稿箱上传审核列表方法
  const handleCheck=(id)=>{
    axios.patch(`/news/${id}`,{auditState:1}).then(res=>{
      props.history.push("/audit-manage/list")
      notification.info({
        message: `通知`,
        description:
          `您可以到审核列表中查看您的新闻`,
        placement:'bottomRight',
      });
    })
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
      title: '新闻标题',
      dataIndex: 'title',
      key:'title',
      render:(title,item)=>{
        return <a href={`#/news-manage/preview/${item.id}`}>{title}</a>
      }
    },
    {
      title: '作者',
      dataIndex: 'author',
      key:'author',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key:'category',
      render:(category)=>{
        return category.title
      }
    },
    {
      title:'操作',
      key:'action',
      render:item=>{
        return (
          <div>
            <Button type="danger" style={{marginRight: 10}} shape="circle" icon={<DeleteOutlined/>} 
              onClick={()=>confirmDelete(item)} />
            <Button type="primary" style={{marginRight: 10}} shape="circle" icon={<EditOutlined/>}
              onClick={()=>{props.history.push(`/news-manage/update/${item.id}`)}}/>
            <Button type="primary" shape="circle" icon={<UploadOutlined/>} onClick={()=>handleCheck(item.id)} />
          </div>
        )
      }
    }
  ];

  return (
    <div>
      <Table dataSource={dataSource} columns={columns} rowKey={item=>item.id} pagination={{pageSize:5}} />
    </div>
  )
}


