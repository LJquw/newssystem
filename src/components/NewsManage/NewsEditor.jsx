/* 
  封装富文本编辑器组件
  npm install --save react-draft-wysiwyg draft-js   富文本编辑依赖
  npm install --save draftjs-to-html
  npm install --save html-to-draftjs
*/

import React,{useEffect, useState} from 'react'
import {Editor} from 'react-draft-wysiwyg'  
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { convertToRaw,ContentState,EditorState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import HtmlToDraft from "html-to-draftjs"

export default function NewsEditor(props) {
  const [editorState,setEditorState]=useState();

  // 接收更新传过来已知的内容
  useEffect(()=>{
    const html=props.content
    if(html===undefined) return
    const contentBlock=HtmlToDraft(html)
    if(contentBlock){
      const contentState=ContentState.createFromBlockArray(contentBlock.contentBlocks)
      const editorState=EditorState.createWithContent(contentState)
      setEditorState(editorState)
    }
  },[props.content])

  return (
    <div>
      <Editor
        editorState={editorState}
        toolbarClassName="toolbarClassName"
        wrapperClassName="wrapperClassName"
        editorClassName="editorClassName"
        onEditorStateChange={editorState => setEditorState(editorState)}
        onBlur={() => {
          props.getContent(
            draftToHtml(convertToRaw(editorState.getCurrentContent()))
          );
        }}
      />
    </div>
  )
}
