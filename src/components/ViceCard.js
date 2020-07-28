import React from 'react'
import { selectViceById } from '../model/viceSlice'
import { useSelector, useDispatch } from 'react-redux'
import { Typography, List } from 'antd';

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
      maxHeight: '140px', 
      overflow: 'hidden'
    }}>
      <Title level={3} >
        {vice.name}
      </Title>
      <Text code={true}>{vice.refTag}</Text>

      <Paragraph>{vice.description}</Paragraph>
      <Paragraph>{vice.defaultEngagementRestriction}</Paragraph>
      <Paragraph>{vice.negativeImpactDescription}</Paragraph>
      <Paragraph>{vice.seductionDescription}</Paragraph>
      <List dataSource={vice.mitigationTactics}
        itemLayout="vertical"
        renderItem={tactic =>
          <Text>{tactic}</Text>
        }>
      </List>
    </div>
  )
}