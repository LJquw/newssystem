/* 
  封装发布管理模块下的通用组件
*/

import React from 'react'
import { Table,Button} from 'antd';

export default function RightList(props) {
  const dataSource=props.dataSource

  //定义Table表格的列
  const columns = [
    {
      title: '新闻标题',
      dataIndex: 'title',
      key:'title',
      render:(title,item)=><a href={`#/news-manage/preview/${item.id}`}>{title}</a>
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
      render:category=>{
        return <div>{category.title}</div>
      }
    },
    {
      title:'操作',
      key:'action',
      render:item=>{
        return (
          <div>
            {
              item.publishState===1&&(
                <Button type="primary" onClick={()=>props.handlePublish(item)}>发布</Button>
              )
            }
            {
              item.publishState===2&&(
                <Button type="primary" onClick={()=>props.handleSunset(item)}>下线</Button>
              )
            }
            {
              item.publishState===3&&(
                <Button danger onClick={()=>props.handleDelete(item)}>删除</Button>
              )
            }
          </div>
        )
      }
    }
  ];

  return (
    <div>
      <Table dataSource={dataSource} columns={columns} pagination={{pageSize:5}} rowKey={item=>item.id} />
    </div>
  )
}
