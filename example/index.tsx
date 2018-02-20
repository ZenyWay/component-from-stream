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
import { from } from 'rxjs/observable/from'
import { interval } from 'rxjs/observable/interval'
import { of } from 'rxjs/observable/of'
import CopyButton from './copy-button'
import {
  concat, defaultIfEmpty, ignoreElements, map, take, takeUntil, tap
} from 'rxjs/operators';

const componentFromStream = createComponentFromStreamFactory(
  Component,
  from
)
const App = componentFromStream(renderApp, fromTimer)

function fromTimer(props$) {
  const timer$ = interval(1000).pipe(
    takeUntil(props$.pipe(ignoreElements(), defaultIfEmpty())),
    map(time),
    take(8),
    concat(of(void 0)) // hide -> unmount children
  )

  return timer$.pipe(tap(log('from-timer:')))
}

function time() {
  const time = new Date().toTimeString()
  return { time }
}

function renderApp({ time }) {
  return (
    <div>
      <p>
				clock A: {time} <CopyButton value={`clock A: ${time}`} />
			</p>
			<br />
			<p>
				clock B: {time} <CopyButton value={`clock B: ${time}`} />
			</p>
    </div>
  )
}

render(<App />, document.getElementById('app'))

function log(label) {
  return console.log.bind(console, label)
}
