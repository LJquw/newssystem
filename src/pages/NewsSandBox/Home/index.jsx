/* 
  主页的路由组件
  npm install echarts --save
*/

import React,{useState,useEffect, useRef} from 'react'
import axios from 'axios'
import {NavLink} from 'react-router-dom'
import * as echarts from 'echarts'
import _ from 'lodash'
import { Card, Col, Row, List, Avatar, Drawer } from 'antd';
import { EditOutlined, EllipsisOutlined, PieChartOutlined } from '@ant-design/icons';

const { Meta } = Card;

export default function Home() {
  // 浏览数量集合列表
  const [viewList,setViewList]=useState([])
  // 点赞数量集合列表
  const [starList,setStarList]=useState([])
  // 当前登录用户数据
  const {username,region,role:{roleName}}=JSON.parse(localStorage.getItem("token"))
  // 图像化数据集合
  const [allList,setAllList]=useState([])
  // 饼状图Drawer 是否可见
  const [visible,setVisible]=useState(false)
  // 饼状图表
  const [pieChart, setPieChart] = useState(null);

  // 柱状图ref
  const barRef=useRef()
  // 饼状图ref
  const pieRef=useRef()

  // 获取浏览数量最多的前6条数据
  useEffect(()=>{
    axios.get(`/news?publishState=2&_expand=category&_sort=view&_order=desc&_limit=6`).then(res=>{
      setViewList(res.data)
    })
  },[])

  // 获取点赞数量最多的前6条数据
  useEffect(()=>{
    axios.get(`/news?publishState=2&_expand=category&_sort=star&_order=desc&_limit=6`).then(res=>{
      setStarList(res.data)
    })
  },[])

  // 获取图像化数据
  useEffect(()=>{
    axios.get(`/news?publishState=2&_expand=category`).then(res=>{
      renderBarView(_.groupBy(res.data,item=>item.category.title))
      setAllList(res.data)
    })
    // 销毁图表自适应功能
    return () => {
      window.onresize = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  },[])

  // 渲染柱状图
  var myChart = echarts.getInstanceById(barRef.current);    // 防止警告
  const renderBarView =(dataObj)=>{
    // 基于准备好的dom，初始化echarts实例
    if (myChart !== null && myChart !== "" && myChart !== undefined) {
      myChart.dispose();
    }
    myChart = echarts.init(barRef.current);

    // 指定图表的配置项和数据
    var option = {
      title: {
        text: '新闻分类图示'
      },
      tooltip: {},
      legend: {
        data: ['数量']
      },
      xAxis: {
        data: Object.keys(dataObj),
        axisLabel: {
          rotate: "45"
        }
      },
      yAxis: {
        minInterval:1 // 保证坐标轴分割刻度显示成整数
      },
      series: [
        {
          name: '数量',
          type: 'bar',
          data: Object.values(dataObj).map(item=>item.length)
        }
      ]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    // 图表自适应
    window.onresize=()=>{
      myChart.resize();
    }
  }

  // 渲染饼图
  const renderPieView=(dataObj)=>{
    // 基于准备好的dom，初始化echarts实例
    var myChart1;
    var option;
    // 获取数据
    var currentList=allList.filter(item=>item.author===username)
    var groupList = _.groupBy(currentList, item => item.category.title);

    // 判断图表是否已经初始化完成
    if(!pieChart){
      myChart1=echarts.init(pieRef.current)
      setPieChart(myChart1)
    }else{
      myChart1=pieChart
    }

    // 最终数据转换
    var list=[]
    for(var i in groupList){
      list.push({
        name:i,
        value:groupList[i].length
      })
    }

    option = {
      title: {
        text: '当前用户新闻分类图示',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '发布数量',
          type: 'pie',
          radius: '50%',
          data: list,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };

    option && myChart1.setOption(option);
  }

  return (
    <div className="site-card-wrapper">
      <Row gutter={16}>
        <Col span={8}>
          <Card title="用户最常浏览" bordered={true}>
            <List
              size="small"
              dataSource={viewList}
              renderItem={item => <List.Item>
                  <NavLink to={`/news-manage/preview/${item.id}`}>
                    {item.title}
                  </NavLink>
                </List.Item>}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="用户点赞最多" bordered={true}>
            <List
              size="small"
              dataSource={starList}
              renderItem={item => <List.Item>
                <NavLink to={`/news-manage/preview/${item.id}`}>
                    {item.title}
                  </NavLink>
              </List.Item>}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            cover={
              <img
                alt="example"
                src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
              />
            }
            actions={[
              <PieChartOutlined key="setting" onClick={()=>{
                setTimeout(()=>{
                  setVisible(true)
                  // init初始化
                  renderPieView()
                },0)
              }} />,
              <EditOutlined key="edit" />,
              <EllipsisOutlined key="ellipsis" />,
            ]}
          >
            <Meta
              avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
              title={username}
              description={
                <div>
                  <b>{region===''?'全球':region}</b>
                  <span style={{paddingLeft:"30px"}}>{roleName}</span>
                </div>
              }
            />
          </Card>
        </Col>
      </Row>
      <Drawer width="500px" title="个人新闻分类" placement="right" closable={true} onClose={()=>setVisible(false)} visible={visible}>
        <div ref={pieRef} style={{height:"400px",width:"100%",marginTop:"30px"}}></div>
      </Drawer>
      <div ref={barRef} style={{height:"400px",width:"100%",marginTop:"30px"}}></div>
    </div>
  )
}
