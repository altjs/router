import React from 'react'
import { Router } from 'react-router'

const isRouteEqual = (prevState, nextState) => {
  if (prevState === nextState) return true
  if (prevState.pathname !== nextState.pathname) return false
  if (prevState.search !== nextState.search) return false

  const a = prevState.state
  const b = nextState.state

  for (const k in a) {
    if (a.hasOwnProperty(k) && (!b.hasOwnProperty(k) || a[k] !== b[k])) {
      return false
    }
  }
  for (const k in b) {
    if (b.hasOwnProperty(k) && !a.hasOwnProperty(k)) {
      return false
    }
  }
  return true
}

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

  bindListeners: {
    push: pushState.id,
    replace: replaceState.id,
    update: updatedHistory.id,
  },

  push(data) {
    const { state, pathname, query } = data
    history.pushState(state, pathname, query)
    this.setState(data)
  },

  replace(data) {
    const { state, pathname, query } = data
    history.replaceState(state, pathname, query)
    this.setState(data)
  },

  update(data) {
    this.setState(data)
    this.preventDefault()
  },
})

const dispatchable = (flux, action) => (state, pathname, query) => {
  return flux.dispatch(action, { state, pathname, query })
}

export default class AltRouter extends React.Component {
  static contextTypes = {
    flux: React.PropTypes.object,
  }

  constructor(props, context) {
    super(props, context)

    const flux = props.flux || context.flux

    this.history = props.history
    this.routes = typeof props.routes === 'function'
      ? props.routes(flux)
      : props.routes

    const store = flux.createStore(makeHistoryStore(this.history))

    flux.router = {
      pushState: dispatchable(flux, pushState),
      replaceState: dispatchable(flux, replaceState),
      store,
    }

    let prevState = {}

    this.historyListener = this.history.listen((routerState) => {
      if (!isRouteEqual(prevState, routerState)) {
        setTimeout(() => flux.dispatch(updatedHistory, routerState))
        props.onRouteUpdated(routerState, prevState);
        prevState = routerState
      }
    })
  }

  componentWillUnmount() {
    this.historyListener()
  }

  render() {
    return <Router history={this.history} routes={this.routes} />
  }
}
