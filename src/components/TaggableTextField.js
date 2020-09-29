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
import { A } from 'aws-amplify-react/lib-esm/AmplifyTheme'
const { Link } = Typography
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

export const TaggableTextField = ({ value, onChange, placeholder }) => {
  const convertedValue = (value ?? "") === ""
    ? ContentState.createFromText("") : convertFromRaw(value)

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

    // TODO (NOW): this fixes the performance issues I'm seeing but we're no longer propagating
    // changes to model...
    //
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