import React, { useState } from 'react'
import { Space, Dropdown } from 'antd'
import { CaretDownOutlined } from '@ant-design/icons';


export const SexyButton = ({ icon, text, color, popupMenu, onClick, isSelected }) => {
  const [isHovered, setHovered] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const transition = "120ms linear"
  const cursor = 'pointer'
  const height = '40px'
  const boxShadow = '1px 1px 2px gray'
  const borderWidth = '1px'
  const backgroundColor = color

  const borderStyle = isSelected ? 'solid' : 'hidden'
  const contentMargin = isSelected ? '12px' : '13px'

  const width = isHovered ? '135px' : height
  const borderRadius = isHovered ? '2px' : '50%'

  const style = {
    cursor,
    height,
    transition,
    boxShadow,
    backgroundColor,
    borderWidth,
    borderStyle,
    width,
    borderRadius
  }

  return (
    <div style={style} onClick={onClick}
      onMouseEnter={e => setHovered(true)} onMouseLeave={e => setHovered(false)}>
      <Space  direction='horizontal' align='center' style={{ height: '100%', paddingLeft: contentMargin }}>
        {icon}
        {isHovered && text}
      </Space>
      {isHovered && popupMenu &&
        <Dropdown onClick={e => e.stopPropagation()} overlay={popupMenu} trigger={['click']} placement='bottomCenter'>
          <div style={{
            right: '-28%',
            position: 'relative',
            display: 'inline-block',
            marginTop: '10px',
            borderLeftStyle: 'solid',
            paddingLeft: '6px',
            paddingRight: '10px',
            borderLeftColor: 'rgba(0, 0, 0, 0.25)'
          }}
          >
            <CaretDownOutlined />
          </div>
        </Dropdown>}
    </div>
  )
}