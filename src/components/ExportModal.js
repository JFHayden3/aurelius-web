import React, { useState } from 'react'
import { downloadArticles } from '../model/journalArticlesSlice'
import { selectFilter } from '../model/metaSlice'
import { useSelector, useDispatch } from 'react-redux'
import { ArticleFilterWidget } from './ArticleFilterWidget'
import { Modal, Radio, Space, Typography } from 'antd'
const { Text } = Typography

const exportFilterChoices = {
  ALL: { key: 'ALL', display: 'All' },
  CURRENT_FILTER: { key: 'CURRENT_FILTER', display: 'Currently filtered' },
  CUSTOM_FILTER: { key: 'CUSTOM_FILTER', display: 'Set filter' }
}
export const ExportModal = ({ isVisible, close }) => {
  const currentFilter = useSelector(state => selectFilter(state))
  const [exportFilterChoice, setExportFilterChoice] = useState(exportFilterChoices.ALL.key)
  const [exportFilter, setExportFilter] = useState(currentFilter)

  const dispatch = useDispatch()
  const onConfirm = e => {
    var downloadFilter = {}
    switch (exportFilterChoice) {
      case exportFilterChoices.CURRENT_FILTER.key:
        downloadFilter = currentFilter
        break;
      case exportFilterChoices.CUSTOM_FILTER.key:
        downloadFilter = exportFilter
        break;
    }
    dispatch(downloadArticles({ downloadFilter }))
      .then(res => {
        const { link, fileName } = res.payload
        fetch(link)
          .then(response =>
            response.blob().then(blob => {
              let url = window.URL.createObjectURL(blob);
              let a = document.createElement('a')
              a.href = url;
              a.download = fileName
              a.click();
              close()
            })
          )
      })
  }
  const displayedExportFilter = exportFilterChoice === exportFilterChoices.CURRENT_FILTER.key ?
    currentFilter : exportFilter
  return (
    <Modal visible={isVisible}
      onOk={onConfirm}
      destroyOnClose
      onCancel={close}
      title='Export'>
      <Space direction='vertical'>
        <Space direction='horizontal'>
          <Text strong={true}>Entries to export</Text>
          <Radio.Group onChange={e => setExportFilterChoice(e.target.value)} value={exportFilterChoice}>
            {Object.values(exportFilterChoices).map(choice =>
              <Radio value={choice.key}>{choice.display}</Radio>)}
          </Radio.Group>
        </Space>
        {exportFilterChoice !== exportFilterChoices.ALL.key &&
          <ArticleFilterWidget
            defaultValue={displayedExportFilter}
            isDisabled={exportFilterChoice !== exportFilterChoices.CUSTOM_FILTER.key}
            onChange={setExportFilter}
          />}
      </Space>
    </Modal>
  )
}