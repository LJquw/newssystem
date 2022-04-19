/* 
    新闻详情页面(游客系统)
*/

import React,{useEffect,useState} from 'react'
import { PageHeader, Descriptions } from 'antd'
import { HeartTwoTone } from '@ant-design/icons'
import moment from "moment"
import axios from 'axios'

export default function Detail(props) {
  // 新闻消息
  const [newsInfo, setNewsInfo] = useState(null);
  
  useEffect(()=>{
    const newsId=props.match.params.id
    axios.get(`/news/${newsId}?_expand=category&_expand=role`).then(res=>{
      setNewsInfo({
        ...res.data,
        // 刷新访问量+1
        view:res.data.view+1
      })
      // 同步后端
      return res.data
    }).then(res=>{
      axios.patch(`/news/${props.match.params.id}`,{
        view:res.view+1
      })
    })
  },[props.match.params.id])

  // 点赞+1
  const handleStar=()=>{
    setNewsInfo({
      ...newsInfo,
      star:newsInfo.star+1
    })
    axios.patch(`/news/${props.match.params.id}`,{
      star:newsInfo.star+1
    })
  }

  return (
    <div>
      {
        newsInfo&&<div>
          <PageHeader
            onBack={() => window.history.back()}
            title={newsInfo.title}
            subTitle={<div>
              {newsInfo.category.title}
              <HeartTwoTone style={{marginLeft:"12px"}} onClick={()=>handleStar()} twoToneColor="#eb2f96" />
              </div>}
          >
            <Descriptions size="small" column={3}>
              <Descriptions.Item label="创建者">{newsInfo.author}</Descriptions.Item>
              <Descriptions.Item label="发布时间">{newsInfo.publishTime
                ?moment(newsInfo.publishTime).format("YYYY/MM/DD HH:mm:ss"): "-"}</Descriptions.Item>
              <Descriptions.Item label="区域">{newsInfo.region}</Descriptions.Item>
              <Descriptions.Item label="访问数量">{newsInfo.view}</Descriptions.Item>
              <Descriptions.Item label="点赞数量">{newsInfo.star}</Descriptions.Item>
              <Descriptions.Item label="评论数量">0</Descriptions.Item>
            </Descriptions>
          </PageHeader>

          <div dangerouslySetInnerHTML={{
            __html:newsInfo.content
          }} style={{border:'1px solid gray',margin: '0px 24px','borderRadius':'2px'}}>
          </div>
        </div>
      }
    </div>
  )
}

