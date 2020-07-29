import React from 'react'
import { selectViceById } from '../model/viceSlice'
import { useSelector, useDispatch } from 'react-redux'
import { Typography, List, Row, Col } from 'antd';

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
          <Text style={{float:"right"}} code={true}>{vice.refTag}</Text>
        </Col>
      </Row>
      <Paragraph ellipsis={{rows:3}}>{vice.description}</Paragraph>
     
    </div>
  )
}