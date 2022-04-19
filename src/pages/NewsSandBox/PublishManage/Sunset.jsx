/* 
  已下线新闻组件,属于发布管理模块下的二级路由组件
  publishState=3的新闻会出现在此组件中
*/


import React from 'react'
import NewsPublish from '../../../components/PublishManage/NewsPublish'
import usePublish from '../../../hooks/usePublish'

export default function Sunset() {
  // 已下线新闻集合
  const {dataSource,handleDelete}=usePublish(3)

  return (
    <div>
      <NewsPublish dataSource={dataSource} handleDelete={handleDelete}/>
    </div>
  )
}

