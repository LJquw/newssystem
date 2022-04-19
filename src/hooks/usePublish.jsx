/* 
  封装发布管理模块中三个模块的通用逻辑操作
*/

import {useState,useEffect} from "react";
import axios from "axios";
import { notification } from "antd";

export default function usePublish(type) {
  const [dataSource,setDataSource]=useState([])
  // 获取登录用户数据
  const {username}=JSON.parse(localStorage.getItem("token"))

  // 获取操作数据
  useEffect(()=>{
    axios.get(`/news?author=${username}&publishState=${type}&_expand=category`).then(res=>{
      setDataSource(res.data)
    })
  },[username,type])

  // 发布
  const handlePublish=(item)=>{
    // 把当前点击的数据从待发布列表中移除
    setDataSource(dataSource.filter(data=>data.id!==item.id))
    axios.patch(`/news/${item.id}`,{
      publishState:2,
      publishTime:Date.now()
    }).then(res=>{
      notification.info({
        message: "通知",
        description: "您可以到【发布管理/已发布】中查看您的新闻",
        placement: "bottomRight"
      });
    })
  }

  // 下线
  const handleSunset=(item)=>{
    // 把当前点击的数据从发布列表中移除
    setDataSource(dataSource.filter(data=>data.id!==item.id))
    axios.patch(`/news/${item.id}`,{
      publishState:3,
      publishTime:Date.now()
    }).then(res=>{
      notification.info({
        message: "通知",
        description: "您可以到【发布管理/已下线】中查看您的新闻",
        placement: "bottomRight"
      });
    })
  }

  // 删除
  const handleDelete=(item)=>{
    // 把当前点击的数据从已下线列表中移除
    setDataSource(dataSource.filter(data=>data.id!==item.id))
    axios.patch(`/news/${item.id}`).then(res=>{
      notification.info({
        message: "通知",
        description: "您已经删除了已下线的新闻",
        placement: "bottomRight"
      });
    })
  }


  return {
    dataSource,
    handlePublish,
    handleSunset,
    handleDelete
  }
}
