/* 
  审核新闻组件,属于审核管理模块下的二级路由组件
  auditState:0(草稿箱)||1(正在审核)||2(通过)||3(拒绝)
  publishState:0(审核列表/草稿箱)||1(待发布)||2(已发布)||3(已下线)
  审核新闻必须要管理员审核，编辑无权限审核，可以是本区域的管理员以及超级管理员，不能跨区域管理员审核，通过之后只能由作者发布
  审核列表只能看到自己撰写的新闻
*/

import React,{useState,useEffect} from 'react'
import axios from 'axios'
import { Table, Button, notification} from "antd";

export default function Audit(props) {
  // 审核新闻集合
  const [auditNews, setAuditNews] = useState([]);
  // 获取登录用户的数据
  const { roleId, region, username } = JSON.parse(localStorage.getItem("token"));

  // 获取数据
  useEffect(()=>{
    const roleObj={
      "1":"superadmin",
      "2":"admin",
      "3":"editor"
    }
    axios.get(`/news?auditState=1&_expand=category`).then(res=>{
      setAuditNews(roleObj[roleId]==="superadmin"?res.data:[
        ...res.data.filter(item=>item.author===username),
        ...res.data.filter(item=>item.region===region&&roleObj[item.roleId]==="editor"),
      ])
    })
  },[region, roleId, username])

  // 审核处理方法
  const handleAudit=(item,auditState,publishState)=>{
    // 把当前点击的数据从审核新闻中移除
    setAuditNews(auditNews.filter(data=>data.id!==item.id))
    // 修改auditState和publishState
    axios.patch(`/news/${item.id}`,{
      auditState,
      publishState
    }).then(res=>{
      notification.info({
        message: `通知`,
        description:`您可以到[审核管理/审核列表]中查看您的新闻`,
        placement:'bottomRight',
      });
    })
  }

  //定义Table表格的列
  const columns = [
    {
      title: '新闻标题',
      dataIndex: 'title',
      key:'title',
      render:(title,item)=>{
        return <a href={`#/news-manage/preview/${item.id}`} key={item.id}>{title}</a>
      }
    },
    {
      title: '作者',
      dataIndex: 'author',
      key:'author',
    },
    {
      title: '新闻分类',
      dataIndex: 'category',
      key:'category',
      render:(category)=>{
        return <div>{category.title}</div>
      }
    },
    {
      title:'操作',
      key:'action',
      render:item=>{
        return (
          <div>
            <Button type='primary' onClick={()=>handleAudit(item,2,1)}>通过</Button>
            <Button danger style={{marginLeft:10}} onClick={()=>handleAudit(item,3,0)}>驳回</Button>
          </div>
        )
      }
    }
  ];

  return (
    <div>
      <Table dataSource={auditNews} columns={columns} pagination={{pageSize:5}} rowKey={item=>item.id} />
    </div>
  )
}
