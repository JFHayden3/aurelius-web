import React from 'react'
import { selectViceById, deleteVice } from '../model/viceSlice'
import { useSelector, useDispatch } from 'react-redux'
import { Typography, List, Row, Col, Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom'
const { Title, Text, Paragraph } = Typography;

export const ViceCard = ({ viceId }) => {
  const vice = useSelector(state => selectViceById(state, viceId))
  const dispatch = useDispatch()
  const onDeleteClick = e => {
    e.preventDefault()
    dispatch(deleteVice({ viceId }))
  }
  return (
    <div style={{
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'lightgray',
      borderRadius: '6px',
      padding: '4px',
      background: '#fbdfe1',
      height: '140px',
      overflow: 'hidden'
    }}>
      <Row>
        <Col>
          <Title level={3} >
            {vice.name}
          </Title>
        </Col>
        <Col flex="auto">
          <div style={{ float: "right" }}>
            <Button type="text">
              <Link to={`/vices/edit/${viceId}`}><EditOutlined /></Link>
            </Button>
            <Button type="text" onClick={onDeleteClick}>
              <DeleteOutlined />
            </Button>
          </div>
        </Col>
      </Row>
      <Text code={true}>{vice.refTag}</Text>
      <Paragraph ellipsis={{ rows: 3 }}>{vice.description}</Paragraph>

    </div>
  )
}