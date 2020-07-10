import React, { Component } from 'react'
import { connect } from 'react-redux'
import LifeJournal from '../components/LifeJournal'
import PropTypes from 'prop-types'

class JournalApp extends Component {
  render() {
    return (
      <div>
        <LifeJournal entries={this.props.entries}/>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return { entries: state.entries } 
}

JournalApp.propTypes = {
  entries: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(JournalApp)