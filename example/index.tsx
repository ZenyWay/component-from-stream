/*
 * Copyright 2018 Stephane M. Catala
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */
import createComponentFromStreamFactory from '../src'
import { render, Component } from 'inferno'
import { createElement } from 'inferno-create-element'
import { Observable } from 'rxjs'
import CopyButton from './copy-button'

const componentFromStream = createComponentFromStreamFactory(
  Component,
  Observable.from
)
const App = componentFromStream(renderApp, fromTimer)

function fromTimer(props$) {
  const timer$ = Observable.interval(1000)
    .takeUntil(props$.last().do(log('last:'), log('error:'), log('done:')))
    .map(time)
    .take(8)
    .concat(Observable.of(void 0)) // hide -> unmount children

  return timer$.do(log('from-timer:'))
}

function time() {
  const time = new Date().toTimeString()
  return { time }
}

function renderApp({ time }) {
  return (
    <div>
      <CopyButton value={`A: ${time}`} />
      <CopyButton value={`B: ${time}`} />
    </div>
  )
}

render(<App />, document.getElementById('app'))

function log(label) {
  return console.log.bind(console, label)
}
