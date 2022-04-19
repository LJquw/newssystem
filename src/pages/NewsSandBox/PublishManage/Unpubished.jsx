/* 
  待发布新闻组件,属于发布管理模块下的二级路由组件
  publishState=1的新闻会出现在此组件中
*/

import React from 'react'
import NewsPublish from '../../../components/PublishManage/NewsPublish'
import usePublish from '../../../hooks/usePublish'

export default function Unpubished() {
  // 待发布新闻集合
  const {dataSource,handlePublish}=usePublish(1)

  return (
    <div>
      <NewsPublish dataSource={dataSource} handlePublish={handlePublish}/>
    </div>
  )
}
