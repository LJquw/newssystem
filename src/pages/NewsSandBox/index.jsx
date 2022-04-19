/**
 * 后台管理路由的主页面
 * npm install --save nprogress
 */

import React, { useEffect } from 'react'
import { Layout} from 'antd'
import NProgress from 'nprogress'
import "nprogress/nprogress.css"
import SideMenu from "../../components/SandBox/SideMenu"
import TopHeader from "../../components/SandBox/TopHeader"
import NewsRouter from '../../components/SandBox/NewsRouter'
import "./style.css"

const { Content } = Layout;
export default function NewsSandBox() {
  NProgress.start()

  useEffect(()=>{
    NProgress.done()
  })

  return (
    <Layout>
      <SideMenu/>
      <Layout className='site-layout'>
        <TopHeader/>
        <Content className="site-layout-background" style={{margin: '24px 16px',padding: 24,minHeight: 280,overflow:'auto'}}>
          <NewsRouter/>
        </Content>
      </Layout>
    </Layout>
  )
}


// 后台管理的主页面
