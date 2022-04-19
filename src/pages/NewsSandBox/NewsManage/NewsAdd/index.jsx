/* 
  该组件是新闻管理模块下的撰写新闻组件
*/

import React,{useState,useEffect,useRef} from 'react'
import axios from "axios"
import {PageHeader, Steps, Button, Form, Input, Select, message, notification, } from "antd"
import NewsEditor from '../../../../components/NewsManage/NewsEditor'
import style from "./index.module.css"

const { Step } = Steps;
const { Option } = Select;

export default function NewsAdd(props) {
  // 步骤条状态控制
  const [current, setCurrent] = useState(0);
  // 新闻分类列表
  const [categoryList, setCategoryList] = useState([])
  // 获取表单信息
  const [formInfo, setFormInfo] = useState({})
  // 获取编辑的内容信息
  const [content, SetContent] = useState("")
  // 获取登录信息
  const { region, roleId, username } = JSON.parse(localStorage.getItem("token"))

  // 校验表单
  const NewsForm=useRef(null)

  //获取新闻分类列表
  useEffect(()=>{
    axios.get("/categories").then(res=>{
      setCategoryList(res.data)
    })
  },[])

  // 点击进入下一步
  const handleNext=()=>{
    // 先判断是否初一第一步
    if(current===0){
      // 如果是第一步就进行表单验证
      NewsForm.current.validateFields().then(res=>{
        setFormInfo(res)
        setCurrent(current+1)
      }).catch(err=>{
        console.log(err);
      })
    }else{
      if(content===""||content.trim()==="<p></p>"){
        message.error("新闻内容不能为空")
      }else{
        setCurrent(current+1)
      }
    }
  }

  // 点击返回上一步
  const handlePrevious=()=>{
    setCurrent(current-1)
  }

  // 表单划分显示比例
  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  };

  //点击保存到草稿箱和提交审核按钮的回调
  const handleSave=(auditState)=>{
    axios.post("/news",{
      ...formInfo,
      content: content,
      region: region === "" ? "全球" : region,
      author: username,
      roleId: roleId,
      auditState: auditState,
      publishState: 0,
      createTime: Date.now(),
      star: 0,
      view: 0,
    }).then(res=>{
      props.history.push(auditState===0?"/news-manage/draft":"/audit-manage/list")
      notification.info({
        message: `通知`,
        description:
          `您可以到${auditState===0?'草稿箱':'审核列表'}中查看您的新闻`,
        placement:'bottomRight',
      });
    })
  }

  return (
    <div>
      {/* 标题部分 */}
      <PageHeader
        className="site-page-header"
        title="撰写新闻"
        subTitle="This is a subtitle"
      />
      {/* 步骤条部分 */}
      <Steps current={current}>
        <Step title="基本信息" description="新闻标题，新闻分类" />
        <Step title="新闻内容" description="新闻主体内容" />
        <Step title="新闻提交" description="保存草稿或提交审核" />
      </Steps>
      {/* 操作内容部分 */}
      <div style={{marginTop:"50px"}}>
        <div className={current===0?'':style.active}>
          <Form name="basic" {...layout} ref={NewsForm}>
            <Form.Item name="title" label="新闻标题" rules={[{required:true,message:'Please input your title!'}]}>
              <Input />
            </Form.Item>
            <Form.Item name="categoryId" label="新闻分类" rules={[{required:true,message:'Please select your option'}]}>
              <Select>
                {
                  categoryList.map(item=>
                    <Option value={item.id} key={item.id}>{item.title}</Option>
                  )
                }                
              </Select>
            </Form.Item>
          </Form>
        </div>
        <div className={current===1?'':style.active}>
          <NewsEditor getContent={(value)=>{
            SetContent(value)
          }}/>
        </div>
        <div className={current===2?'':style.active}>

        </div>
      </div>
      {/* 按钮部分 */}
      <div style={{marginTop:"50px"}}>
        {
          current===2&&<span>
            <Button type='primary' onClick={()=>handleSave(0)}>保存草稿箱</Button>
            <Button danger onClick={()=>handleSave(1)}>提交审核</Button>
          </span>
        }
        {
          current<2&&<Button type='primary' onClick={handleNext}>下一步</Button>
        }
        {
          current>0&&<Button onClick={handlePrevious}>上一步</Button>
        }
      </div>
    </div>
  )
}
