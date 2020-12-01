import React, { useState, Component } from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Typography, Popover, Space } from 'antd'
import { selectAllTagEntitys, selectTagEntityById } from '../model/tagEntitySlice'
import { getEntityColor, getEntityIcon } from '../kitchenSink'
import { EditorState, ContentState, convertToRaw, convertFromRaw } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin';
import 'draft-js/dist/Draft.css';
const { Link, Paragraph, Title } = Typography

const MentionedTag = (mentionProps) => {
  // TODO: different styling for vices.virtues
  // TODO: less shitty pop-up
  // TODO: validate for broken links (deleted vice/virtues) and do something about them
  const entityId = mentionProps.mention.entityId
  const entity = useSelector(state => selectTagEntityById(state, entityId))
  const history = useHistory()

  const onTagClick = e => {
    if (entity) {
      var linkPrefix
      switch (mentionProps.mention.kind) {
        case 'VICE':
          linkPrefix = 'vices'
          break;
        case 'VIRTUE':
          linkPrefix = 'virtues'
          break;
        case 'CHALLENGE':
          linkPrefix = 'challenges'
          break;
      }
      history.push(`/${linkPrefix}/edit/${entityId}`)
    }
  }

  const color = getEntityColor(mentionProps.mention.kind)
  const icon = getEntityIcon(mentionProps.mention.kind)
  return (
    <Popover overlayStyle={{ borderColor: color, antPopoverContent: { borderColor: color } }}
      color={color} content={entity &&
        <Space size='small' direction='vertical' style={{ maxWidth: '250px', backgroundColor: getEntityColor(mentionProps.mention.kind) }}>
          <span><Title style={{display:'inline', marginRight:'20px'}} level={3}>{entity.name}</Title><div style={{ float: 'right', marginTop:'8px' }}>{icon}</div></span>
          <Paragraph ellipsis={{
            rows:3,
            expandable: true}}>{entity.description}</Paragraph>
        </Space>}>
      <Link onClick={onTagClick}>{mentionProps.children}</Link>
    </Popover>
  )
}

export const TaggableTextField = ({ value, onChange, placeholder, isReadOnly }) => {
  const convertedValue = (value ?? "") === ""
    ? ContentState.createFromText("") : convertFromRaw(value)


  const allRefTags = useSelector(selectAllTagEntitys).map((entity) => {
    return { name: entity.refTag, entityId: entity.id, kind: entity.kind }
  })
  return (
    <AutocompleteEditor
      isReadOnly={isReadOnly}
      placeholder={isReadOnly ? "" : placeholder}
      allRefTags={allRefTags}
      value={convertedValue}
      onChange={onChange} />
  )
}

class AutocompleteEditor extends Component {
  constructor(props) {
    super(props);
    this.syncIfDirty = this.syncIfDirty.bind(this)
    const { allRefTags } = props
    this.mentionPlugin = createMentionPlugin({
      allRefTags,
      mentionPrefix: '#',
      mentionTrigger: '#',
      mentionComponent: MentionedTag,
    });
  }

  syncIfDirty() {
    // TODO: we're unnecessarily blasting the initial update back down. Fix this
    if (this.state.isDirty) {
      this.props.onChange(convertToRaw(this.state.editorState.getCurrentContent()))
      this.state.isDirty = false
    }
  }

  componentWillUnmount() {
    clearInterval(this.dirtySyncTimer)
  }

  componentDidMount() {
    this.dirtySyncTimer = setInterval(this.syncIfDirty, 2500);
  }

  state = {
    editorState: EditorState.createWithContent(this.props.value),
    suggestions: this.props.allRefTags,
    isDirty: false,
  };

  onChange = (editorState) => {
    if (editorState.getCurrentContent() !== this.state.editorState.getCurrentContent()) {
      this.setState({ isDirty: true })
    }
    this.setState({
      editorState,
    });
  };

  onSearchChange = ({ value }) => {
    this.setState({
      suggestions: defaultSuggestionsFilter(value, this.props.allRefTags),
    });
  };

  focus = () => {
    this.editor.focus();
  };

  render() {
    const { MentionSuggestions } = this.mentionPlugin;
    const plugins = [this.mentionPlugin];
    return (
      <div /** className={editorStyles.editor} */ onClick={this.focus}>
        <Editor
          readOnly={this.props.isReadOnly}
          editorState={this.state.editorState}
          onChange={this.onChange}
          placeholder={this.props.placeholder}
          plugins={plugins}
          ref={(element) => { this.editor = element; }}
        />
        <MentionSuggestions
          onSearchChange={this.onSearchChange}
          suggestions={this.state.suggestions}
        />
      </div>
    );
  }
}