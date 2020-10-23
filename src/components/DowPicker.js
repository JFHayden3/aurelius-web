import React, { useState } from 'react'
import { Select, Dropdown, Menu, Button } from 'antd';
import { DownOutlined, CheckOutlined } from '@ant-design/icons';

const { Option } = Select

export const DowPicker = ({ value, onChange }) => {
  const [menuVisible, setMenuVisible] = useState(false)
  const sortedVal = [...value].map(v => "" + v)
  sortedVal.sort()

  const options = {
    0: { abrev: 'S', short: 'Sun', long: 'Sunday' },
    1: { abrev: 'M', short: 'Mon', long: 'Monday' },
    2: { abrev: 'T', short: 'Tues', long: 'Tuesday' },
    3: { abrev: 'W', short: 'Wed', long: 'Wednesday' },
    4: { abrev: 'Th', short: 'Thur', long: 'Thursday' },
    5: { abrev: 'F', short: 'Fri', long: 'Friday' },
    6: { abrev: 'S', short: 'Sat', long: 'Saturday' }
  }
  function computeSelectedText(sortedVal) {
    switch (sortedVal.length) {
      case 0:
        return "Select days..."
      case 1:
        return options[sortedVal[0]].long + 's' // "Fridays", "Tuesdays"
      case 2:
        if (sortedVal.includes('0') && sortedVal.includes('6')) {
          return 'Weekends'
        } else {
          return sortedVal.map(v => options[v].long).join(' and ')
        }
      case 3:
      case 4:
        return sortedVal.map(v => options[v].short).join(', ')
      case 5:
        if (sortedVal.includes('1')
          && sortedVal.includes('2')
          && sortedVal.includes('3')
          && sortedVal.includes('4')
          && sortedVal.includes('5')) {
            return 'Weekdays'
          } else {
            return sortedVal.map(v => options[v].abrev).join('')
          }
      case 6:
        return sortedVal.map(v => options[v].abrev).join('')
      case 7:
        return 'Everyday'
    }
  }
  const selectedText = computeSelectedText(sortedVal)

  const onMenuItemClick = item => {
    const key = item.key
    if (sortedVal.includes(key)) {
      onChange(value.filter(v => v != key))
    } else {
      const newValue = [...value]
      newValue.push(Number.parseInt(key))
      newValue.sort()
      onChange(newValue)
    }
  }
  const handleVisibleChange = flag => {
    setMenuVisible(flag);
  }
  const menu = (
    <Menu multiple={true} selectedKeys={sortedVal} selectable={true}>
      {Object.entries(options).map(([k, v]) =>
        <Menu.Item key={k} onClick={onMenuItemClick}>
          {v.long} {sortedVal.includes(k) && <CheckOutlined style={{ float: 'right' }} />}
        </Menu.Item>
      )}
    </Menu>)

  const onSelect = v => {
    v.sort()
    onChange(v)
  }
  return (
    <Dropdown onVisibleChange={handleVisibleChange} visible={menuVisible}
      overlay={menu} trigger={['click']}>
      <Button>{selectedText} <DownOutlined /></Button>
    </Dropdown>
  )
}