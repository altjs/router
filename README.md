# alt-router

Setup

```js
import AltRouter from 'alt-router'
import React from 'react'
import createBrowserHistory from 'history/lib/createBrowserHistory'

// your alt instance
import alt from '../alt'

const routes = (
  <Route path="/" component={App}>
    <Route path="about" component={About} />
    <Route path="inbox" component={Inbox} />
  </Route>
)

React.render((
  <AltRouter flux={alt} history={createBrowserHistory()} routes={routes} />
), document.getElementById('root'))
```

Changing routes

```js
import alt from '../alt'

const changeRoute = () => {
  alt.router.pushState(null, '/home')
}
```

Bootstrap routes

> For when you want to reload a user's entire application state including which route they were in

```js
const bootstrapState = {
  state: null,
  pathname: '/notifications',
}

alt.bootstrap({ AltHistoryStore: bootstrapState })
```
