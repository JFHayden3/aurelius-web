import React from 'react'
import { selectVirtueById, updateEntity } from '../model/tagEntitySlice'
import { useSelector, useDispatch } from 'react-redux'
import { Typography, Space } from 'antd';
import { EngagementScheduleEditor } from './EngagementScheduleEditor'
import { WrittenResponse, gutter, colSpan, TextItemList } from './ViceVirtueSharedStuff'
const { Title, Text } = Typography;

export const VirtueEditor = ({ match }) => {
  const { virtueId } = match.params
  const virtue = useSelector(state => selectVirtueById(state, virtueId))
  const dispatch = useDispatch()
  const onTextFieldChange = ({ fieldName, value }) => {
    dispatch(updateEntity({ tagEntityId: virtue.id, changedFields: { [fieldName]: value } }))
  }
  const newTacticId = virtue.engagementTactics.length > 0 ?
    (Math.max.apply(null, virtue.engagementTactics.map(mt => mt.id)) + 1)
    : 0
  const onAddTacticClick = e => {
    const newTactics = virtue.engagementTactics.concat({ id: newTacticId, text: "" })
    dispatch(updateEntity({ tagEntityId: virtueId, changedFields: { engagementTactics: newTactics } }))
  }
  const onRemoveTactic = targetId => {
    const newTactics = virtue.engagementTactics.filter(et => et.id !== targetId)
    dispatch(updateEntity({ tagEntityId: virtueId, changedFields: { engagementTactics: newTactics } }))
  }
  function onTacticTextChange(targetId, str) {
    const newTactics = virtue.engagementTactics.map(tactic => {
      if (tactic.id === targetId) {
        return { id: tactic.id, text: str }
      } else {
        return tactic
      }
    })
    dispatch(updateEntity({ tagEntityId: virtueId, changedFields: { engagementTactics: newTactics } }))
  }
  const onEngagementScheduleChange = val => {
    dispatch(updateEntity({ tagEntityId: virtueId, changedFields: { engagementSchedule: val } }))
  }

  if (!virtue) {
    return (
      <div>Unknown virtue</div>
    )
  }
  return (
    <Space direction='vertical' size="large"
      style={{
        padding: 16, margin: 16,
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '12px'
      }}>
      <Title level={2}>{virtue.name}</Title>
      <Space direction='horizontal' size='small'>
        <Text strong={true}>Reference Tag</Text>
        <Text code={true}>#{virtue.refTag}</Text>
      </Space>
      <Space style={{ maxWidth: '1000px', minWidth: '520px' }} direction='vertical'>
        <Text strong={true}>Scheduled engagement</Text>
        <EngagementScheduleEditor
          engagementSchedule={virtue.engagementSchedule}
          onScheduleChange={onEngagementScheduleChange}
          maxSchedTextLength={50}
        />
      </Space>
      <WrittenResponse
        text="Description"
        entity={virtue}
        fieldName="description"
        minRows={3}
        onValueChange={onTextFieldChange}
      />
      <WrittenResponse
        text="Describe how this behavior positively impacts your life. You may also describe the potential that it has to postiviely impact your life if you increase your engagement in it."
        entity={virtue}
        fieldName="positiveImpactDescription"
        onValueChange={onTextFieldChange} />
      <Space direction='vertical' style={{ width: '100%' }} >
        <Text strong={true}>What are some ways you can make it easier for yourself to engage in this behavior?</Text>
        <TextItemList
          values={virtue.engagementTactics}
          nextId={newTacticId}
          onAddItem={onAddTacticClick}
          onRemoveItem={onRemoveTactic}
          onChangeItem={onTacticTextChange}
        />
      </Space>
    </Space>
  )
}