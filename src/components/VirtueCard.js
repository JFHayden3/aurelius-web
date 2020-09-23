import React from 'react'
import { selectVirtueById, deleteTagEntityAsync } from '../model/tagEntitySlice'
import { useSelector, useDispatch } from 'react-redux'
import { Typography, List, Row, Col, Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom'
const { Title, Text, Paragraph } = Typography;

export const VirtueCard = ({ virtueId }) => {
  const virtue = useSelector(state => selectVirtueById(state, virtueId))
  const dispatch = useDispatch()
  const onDeleteClick = e => {
    e.preventDefault()
    dispatch(deleteTagEntityAsync({ tagEntityId: virtueId }))
  }
  if (null === virtue) {
    return (
      <div>Unknown virtue</div>
    )
  }
  return (
    <div style={{
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'lightgray',
      borderRadius: '6px',
      padding: '4px',
      background: '#d7f9d7',
      height: '140px',
      overflow: 'hidden'
    }}>
      <Row>
        <Col>
          <Title level={3} >
            {virtue.name}
          </Title>
        </Col>
        <Col flex="auto">
          <div style={{ float: "right" }}>
            <Button type="text">
              <Link to={`/virtues/edit/${virtueId}`}><EditOutlined /></Link>
            </Button>
            <Button type="text" onClick={onDeleteClick}>
              <DeleteOutlined />
            </Button>
          </div>
        </Col>
      </Row>
      <Text code={true}>{virtue.refTag}</Text>
      <Paragraph ellipsis={{ rows: 3 }}>{virtue.description}</Paragraph>

    </div>
  )
}