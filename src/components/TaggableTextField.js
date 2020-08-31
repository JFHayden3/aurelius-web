import React, { useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Mentions, Typography, Dropdown, Menu } from 'antd'
import { selectAllVices } from '../model/viceSlice'
import { selectAllVirtues } from '../model/virtueSlice'
import { Editor, EditorState, ContentState, CompositeDecorator, Modifier, SelectionState } from 'draft-js';
import 'draft-js/dist/Draft.css';
const { Text, Link } = Typography

const { Option } = Mentions

function reftagStrategy(tags) {
  return (contentBlock, callback, contentState) => {
    findAmongTags(tags, contentBlock, callback)
  };
}

function tagCompletionStrategy(tags) {
  return (contentBlock, callback, contentState) => {
    const text = contentBlock.getText()
    for (var i = 0; i < text.length; ++i) {
      if (text[i] === '#') {
        var possibleStartInd = i
        for (; i < text.length; ++i) {
          // TODO: more/smarter word breaks 
          if (text[i] === ' ' || text[i] === '\n' || text[i] === '.' || text[i] === ',') {
            break
          }
        }
        const potentialTagPrefix = text.substring(possibleStartInd + 1, i)
        // now try to find if there are any potential tags that match the hash
        for (var tag of tags) {
          if (tag.length > potentialTagPrefix.length && tag.startsWith(potentialTagPrefix)) {
            callback(possibleStartInd, i)
            // Only need to find one possible match
            break;
          }
        }
      }
    }
  }
}
function findAmongTags(tags, contentBlock, callback) {
  if (tags.length === 0) {
    return
  }
  const text = contentBlock.getText()
  const regex = new RegExp('#' + '(' + tags.join("|") + ')', "g")
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}




//blockKey: "5r1jt"
//children: [{…}]
//contentState: ContentState {_map: Map, __ownerID: undefined}
//decoratedText: "#fast-wipes"
//dir: null
//end: 57
//entityKey: null
//offsetKey: "5r1jt-6-0"
//start: 46

const ViceTagSpan = (props) => {
  return (
    <Link>{props.children}</Link>
  );
};

const VirtueTagSpan = (props) => {
  return (<Link>{props.children}</Link>);
};

const styles = {
  root: {
    fontFamily: '\'Helvetica\', sans-serif',
    padding: 0,
  },
  editor: {
    cursor: 'text',
    fontSize: 16,
    minHeight: 40,
    padding: 0,
  },
  button: {
    marginTop: 10,
    textAlign: 'center',
  },
  handle: {
    color: 'rgba(98, 177, 254, 1.0)',
    direction: 'ltr',
    unicodeBidi: 'bidi-override',
  },
  reftag: {
    color: 'rgba(95, 184, 138, 1.0)',
  },
};

export const TaggableTextField = ({ value, onChange, autoSize, placeholder, style }) => {

  const TagCompletionSpan = (props) => {
    const textWithoutHash = props.decoratedText.substring(1)
    const filterMatchingTags = v => v.refTag.startsWith(textWithoutHash)
    const matchingViceTags = useSelector(selectAllVices).filter(filterMatchingTags).map(v => v.refTag)
    const matchingVirtueTags = useSelector(selectAllVirtues).filter(filterMatchingTags).map(v => v.refTag)

    const menu = (
      <Menu onClick={onItemSelected(textWithoutHash, props.contentState, props.end)}>
        {matchingViceTags.map(tag => <Menu.Item key={tag}>{tag}</Menu.Item>)}
        {matchingVirtueTags.map(tag => <Menu.Item key={tag}>{tag}</Menu.Item>)}
      </Menu>
    )
    return (
      <Dropdown overlay={menu} visible={true}>
        <span
          style={styles.handle}
        >
          {props.children}
        </span>
      </Dropdown>
    );
  };

  const allViceTags = useSelector(selectAllVices).map(v => v.refTag)
  const allVirtueTags = useSelector(selectAllVirtues).map(v => v.refTag)

  const compositeDecorator = new CompositeDecorator([
    {
      strategy: tagCompletionStrategy(allViceTags.concat(allVirtueTags)),
      component: TagCompletionSpan,
    },
    {
      strategy: reftagStrategy(allViceTags),
      component: ViceTagSpan,
    },
    {
      strategy: reftagStrategy(allVirtueTags),
      component: VirtueTagSpan,
    },
  ]);

  const [editorState, setEditorState] = useState(
    EditorState.createWithContent(
      ContentState.createFromText(value),
      compositeDecorator))

  const onEditorStateChange = val => {
    setEditorState(val)
    onChange(val.getCurrentContent().getPlainText())
  }
  function onItemSelected(textWithoutHash, contentState, targetIndex) {
    return e => {
      const refTag = e.key
      const charsToPush = refTag.substring(textWithoutHash.length)
      const sel = contentState.getSelectionBefore().set('focusOffset', targetIndex).set('anchorOffset', targetIndex)
      const newContentState = Modifier.insertText(contentState, sel, charsToPush)
      console.log(JSON.stringify(newContentState))
      // TODO: TOMORROW: content state appears correct in logs. not sure why editor state isn't updating accordingl
      onEditorStateChange(EditorState.push(editorState, newContentState, 'insert-characters'))
    }
  }

  const editor = useRef(null)
  const focus = () => editor.current && editor.current.focus()
  return (
    <div style={styles.root}>
      <div style={styles.editor} onClick={focus}>
        <Editor
          ref={editor}
          placeholder={placeholder}
          editorState={editorState}
          onChange={onEditorStateChange} />
      </div>
    </div>
  )
}
