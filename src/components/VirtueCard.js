import React from 'react'
import { selectVirtueById } from '../model/virtueSlice'
import { useSelector, useDispatch } from 'react-redux'
import { Typography, List, Row, Col, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom'
const { Title, Text, Paragraph } = Typography;

export const VirtueCard = ({ virtueId }) => {
  const virtue = useSelector(state => selectVirtueById(state, virtueId))
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
          <Button style={{ float: "right" }} type="text">
            <Link to={`/virtues/edit/${virtueId}`}><EditOutlined /></Link>
          </Button>
        </Col>
      </Row>
      <Text  code={true}>{virtue.refTag}</Text>
      <Paragraph ellipsis={{ rows: 3 }}>{virtue.description}</Paragraph>

    </div>
  )
}