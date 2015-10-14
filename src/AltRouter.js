import React from 'react'
import { Router } from 'react-router'

export const pushState = {
  id: 'router/history/pushedState',
  dispatch: x => x,
}

export const replaceState = {
  id: 'router/history/replacedState',
  dispatch: x => x,
}

const updatedHistory = {
  id: 'router/history/updatedHistory',
  dispatch: x => x,
}

const makeHistoryStore = history => ({
  displayName: 'AltHistoryStore',

  state: {},

  lifecycle: {
    bootstrap(currentState) {
      const { state, pathname, query } = currentState
      history.replaceState(state, pathname, query)
    }
  },

  reduce(currentState, payload) {
    if (!payload.data) return currentState

    const { state, pathname, query } = payload.data

    if (payload.action === pushState.id) {
      history.pushState(state, pathname, query)
    } else if (payload.action === replaceState.id) {
      history.replaceState(state, pathname, query)
    } else if (payload.action === updatedHistory.id) {
      return payload.data
    } else {
      return currentState
    }
  }
})

const dispatchable = (flux, action) => (state, pathname, query) => {
  return flux.dispatch(action, { state, pathname, query })
}

export default class AltRouter extends React.Component {
  static contextTypes = {
    flux: React.PropTypes.object.isRequired,
  }

  constructor(props, context) {
    super(props, context)

    const flux = props.flux || context.flux

    this.history = props.history
    this.routes = props.routes(flux)

    const store = flux.createStore(makeHistoryStore(this.history))

    flux.router = {
      pushState: dispatchable(flux, pushState),
      replaceState: dispatchable(flux, replaceState),
      store,
    }

    this.historyListener = this.history.listen((routerState) => {
      setTimeout(() => flux.dispatch(updatedHistory, routerState))
    })
  }

  componentWillUnmount() {
    this.historyListener()
  }

  render() {
    return <Router history={this.history} routes={this.routes} />
  }
}
