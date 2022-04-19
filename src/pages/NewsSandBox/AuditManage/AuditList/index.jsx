/* 
  审核列表组件,属于审核管理模块下的二级路由组件,审核状态auditState不为0的新闻会出现在此组件中
  publishState:0(草稿箱)||1(待发布)||2(已发布)||3(已下线)
*/

import React, { useEffect, useState } from 'react'
import axios from "axios"
import { Table,Tag,Button,notification} from 'antd';

export default function AuditList(props) {
  // 登录用户的数据
  const { username } = JSON.parse(localStorage.getItem("token"));
  // 审核列表数据集合
  const [auditList, setAuditList] = useState([]);

  // 取审核列表中的数据 
  useEffect(()=>{
    axios.get(`/news?author=${username}&auditState_ne=0&publishState_lte=1&_expand=category`).then(res=>{
      setAuditList(res.data)
    })
  },[username])

  // 撤销
  const gandleRervert=(item)=>{
    // 把当前点击的数据从审核列表中移除
    setAuditList(auditList.filter(data=>data.id!==item.id))
    // auditState改为0，将当前数据返回到草稿箱中
    axios.patch(`/news/${item.id}`,{auditState:0}).then(res=>{
      notification.info({
        message: `通知`,
        description:`您可以到草稿箱中查看您的新闻`,
        placement:'bottomRight',
      });
    })
  }

  // 发布
  const handlePublish=(item)=>{
    // 把当前点击的数据从审核列表中移除
    setAuditList(auditList.filter(data=>data.id!==item.id))
    // publishState改为2,更改发布时间,将当前数据送入到发布管理/已发布
    axios.patch(`/news/${item.id}`, {
      publishState: 2,
      publishTime: Date.now()
    }).then(res=>{
      // props.history.push("/publish-manage/published");
      notification.info({
        message: "通知",
        description: "您可以到【发布管理/已发布】中查看您的新闻",
        placement: "bottomRight"
      });
    })
  }

  // 更新
  const handleUpdate=(item)=>{
    // 跳转到新闻更新页面进行更新
    props.history.push(`/news-manage/update/${item.id}`)
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
      title: '审核状态',
      dataIndex: 'auditState',
      key:'auditState',
      render:auditState=>{
        const colorList = ["", "orange", "green", "red"];
        const auditList = ["草稿箱", "审核中", "已通过", "未通过"];
        return <Tag color={colorList[auditState]}>{auditList[auditState]}</Tag>;
      }
    },
    {
      title:'操作',
      key:'action',
      render:item=>{
        return (
          <div>
            {
              item.auditState===1&&<Button onClick={()=>gandleRervert(item)}>撤销</Button>
            }
            {
              item.auditState===2&&<Button danger onClick={()=>handlePublish(item)}>发布</Button>
            }
            {
              item.auditState===3&&<Button type="primary" onClick={()=>handleUpdate(item)}>更新</Button>
            }
          </div>
        )
      }
    }
  ];

  return (
    <div>
      <Table dataSource={auditList} columns={columns} pagination={{pageSize:5}} rowKey={item=>item.id} />
    </div>
  )
}

