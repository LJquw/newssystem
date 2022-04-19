/**
 * 新闻分类
 */

 import React,{useState,useEffect,useContext,useRef,createContext} from 'react'
 import { Table, Button, Modal, Form, Input } from "antd"
 import axios from 'axios';
 
 import { 
   DeleteOutlined, 
   ExclamationCircleOutlined 
 } from '@ant-design/icons';
 
 const { confirm } = Modal;
 
 
 export default function NewsCategory(props) {
   //保存Table表格的数据(权限列表数据)
   const [categoryList, setCategoryList] = useState([])
   const EditableContext = createContext(null)
 
   useEffect(()=>{
     axios.get("/categories").then(res=>{
       setCategoryList(res.data)
     })
   },[])
 
   //定义点击删除权限按钮的回调
   const confirmDelete=(item)=>{
     confirm({
       title: '你确定要删除?',
       icon: <ExclamationCircleOutlined />,
       onOk() {
         deleteRights(item);
       },
       onCancel() {
         console.log('Cancel');
       },
     });
   }
 
   //定义删除权限的方法
  const deleteRights=(item)=>{
    // 当前页面同步状态+后端同步
    //删除前端数据,更新页面
    setCategoryList(categoryList.filter(data=>data.id!==item.id))
    //删除后台数据,同步数据
    axios.delete(`/categories/${item.id}`) 
  }

  // 保存修改
  const handleSave=(record)=>{
    setCategoryList(categoryList.map(item=>{
      if(item.id===record.id){
        return {
          id:item.id,
          title:record.title,
          value:record.title
        }
      }
      return item
    }))
    axios.patch(`/categories/${record.id}`,{
      title:record.title,
      value:record.title
    })
  }
 
   //定义Table表格的列
  const columns = [
    {
       title: 'ID',
       dataIndex: 'id',
       key:'id',
       render:id=><b>{id}</b>
    },
    {
      title: '栏目名称',
      dataIndex: 'title',
      key:'title',
      onCell: record => ({
        record,
        editable: true,
        dataIndex: "title",
        title: "栏目名称",
        handleSave
      }),
     },
     {
       title:'操作',
       key:'action',
       render:item=>{
         return (
           <div>
             <Button type="danger" shape="circle" icon={<DeleteOutlined/>} 
               onClick={()=>confirmDelete(item)} />
           </div>
         )
       }
     }
   ];

  const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
      <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  };

  const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
  }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);
  
    useEffect(() => {
      if (editing) {
        inputRef.current.focus();
      }
    }, [editing]);
  
    const toggleEdit = () => {
      setEditing(!editing);
      form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    };
  
    const save = async () => {
      try {
        const values = await form.validateFields();
  
        toggleEdit();
        handleSave({ ...record, ...values });
      } catch (errInfo) {
        console.log('Save failed:', errInfo);
      }
    };
  
    let childNode = children;
  
    if (editable) {
      childNode = editing ? (
        <Form.Item
          style={{ margin: 0 }}
          name={dataIndex}
          rules={[
            {
              required: true,
              message: `${title} is required.`,
            },
          ]}
        >
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        </Form.Item>
      ) : (
        <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
          {children}
        </div>
      );
    }
  
    return <td {...restProps}>{childNode}</td>;
  };
 
   return (
     <div>
       <Table dataSource={categoryList} columns={columns} pagination={{pageSize:5}} 
       rowKey={item=>item.id} components={{
          body: {
            row: EditableRow,
            cell: EditableCell,
          },
       }} />
     </div>
   )
 } 