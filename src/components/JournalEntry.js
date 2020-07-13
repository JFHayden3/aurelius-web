// Contains/arranges all the journal articles for a given day.
// Has a child button with popup for adding new journal articles to the day.

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import JournalArticle from './JournalArticle'
import { List, Card } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

export default class JournalEntry extends Component {
  render() {
    const { value } = this.props
    const { articles, date } = value
    return (
      <List
        dataSource={articles}
        grid={{ gutter: 8, column: 2 }}
        itemLayout="vertical"
        renderItem={article =>
          <List.Item key={article.id}>
            <Card title={article.title}
               type="inner"
               actions={[
                 <DeleteOutlined key="delete" />
               ]}>
              <JournalArticle value={article} />
            </Card>
          </List.Item>
        }
      >
      </List>
    )
  }
}

JournalEntry.propTypes = {
  value: PropTypes.object.isRequired
}