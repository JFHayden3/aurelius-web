import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectAllChallenges, deleteChallenge } from '../model/challengeSlice'
import { List, Space, Typography, Button } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiDateToFe } from '../kitchenSink'
import { Link } from 'react-router-dom'

const { Title, Text } = Typography

export const ChallengeBank = () => {
  const allChallenges = useSelector((state) => selectAllChallenges(state))
  const dispatch = useDispatch()
  function onDeleteClick(id) {
    return e => {
      dispatch(deleteChallenge({ id }))
    }
  }
  return (
    <div>
      <List
        dataSource={allChallenges}
        itemLayout="vertical"
        renderItem={challenge =>
          <List.Item>
            <Space>
              <Title level={4}>{challenge.name}</Title>
              <Text>{apiDateToFe(challenge.startDate)} - {apiDateToFe(challenge.endDate)}</Text>
              <div style={{ float: "right" }}>
                <Button type="text">
                  <Link to={`/challenges/edit/${challenge.id}`}><EditOutlined /></Link>
                </Button>
                <Button type="text" onClick={onDeleteClick(challenge.id)}>
                  <DeleteOutlined />
                </Button>
              </div>
            </Space>
          </List.Item>
        }></List>
    </div>
  )
}