import React, { useState, Component } from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Typography, Popover } from 'antd'
import { selectAllVirtues, selectAllVices } from '../model/tagEntitySlice'
import { ViceCard } from './ViceCard'
import { VirtueCard } from './VirtueCard'
import { EditorState, ContentState, convertToRaw, convertFromRaw } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin';
import 'draft-js/dist/Draft.css';
const { Link } = Typography


export const TaggableTextField = ({ value, onChange, placeholder }) => {
  // TODO: this allows me to create bugs. Shouldn't be necessary. Only doing this because
  // I have legacy entries I don't want to updgrade to the new format right now
  let convertedValue
  try {
    convertedValue = convertFromRaw(value ?? "")
  } catch{
    convertedValue = ContentState.createFromText(value ?? "")
  }
  const allViceRefs = useSelector(selectAllVices).map(v => ['VICE', v])
  const allVirtueRefs = useSelector(selectAllVirtues).map(v => ['VIRTUE', v])
  const allRefTags = allViceRefs.concat(allVirtueRefs).map(([kind, entity]) => {
    return { name: entity.refTag, entityId: entity.id, kind: kind }
  })
  return (
    <AutocompleteEditor
      placeholder={placeholder}
      allRefTags={allRefTags}
      value={convertedValue}
      onChange={onChange} />
  )
}

const MentionedTag = (mentionProps) => {
  // TODO: different styling for vices.virtues
  // TODO: less shitty pop-up
  // TODO: validate for broken links (deleted vice/virtues) and do something about them
  const entityId = mentionProps.mention.entityId
  const [linkPrefix, popoverContent] = mentionProps.mention.kind === 'VICE' ?
    ["vices", (<ViceCard viceId={entityId} />)]
    : ["virtues", (<VirtueCard virtueId={entityId} />)]

  const history = useHistory()

  const onTagClick = e => {
    history.push(`/${linkPrefix}/edit/${entityId}`)
  }

  return (
    <Popover content={popoverContent}>
      <Link onClick={onTagClick}>{mentionProps.children}</Link>
    </Popover>
  )
}

class AutocompleteEditor extends Component {
  constructor(props) {
    super(props);
    const { allRefTags } = props
    this.mentionPlugin = createMentionPlugin({
      allRefTags,
      mentionPrefix: '#',
      mentionTrigger: '#',
      mentionComponent: MentionedTag,
    });
  }

  state = {
    editorState: EditorState.createWithContent(this.props.value),
    suggestions: this.props.allRefTags,
  };

  onChange = (editorState) => {
    this.setState({
      editorState,
    });
    this.props.onChange(convertToRaw(editorState.getCurrentContent()))
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