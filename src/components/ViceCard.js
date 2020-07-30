import React from 'react'
import { selectViceById } from '../model/viceSlice'
import { useSelector, useDispatch } from 'react-redux'
import { Typography, List, Row, Col, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom'
const { Title, Text, Paragraph } = Typography;

export const ViceCard = ({ viceId }) => {
  const vice = useSelector(state => selectViceById(state, viceId))
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
          <Button style={{ float: "right" }} type="text">
            <Link to={`/vices/edit/${viceId}`}><EditOutlined /></Link>
          </Button>
        </Col>
      </Row>
      <Text  code={true}>{vice.refTag}</Text>
      <Paragraph ellipsis={{ rows: 3 }}>{vice.description}</Paragraph>

    </div>
  )
}