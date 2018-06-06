/**
 * @license
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
;
import componentFromStream, { pipe } from './component-from-stream'
import Counter, { CounterProps } from './views/counter'
import { Subject } from 'rxjs'
import { combineLatest, map, scan , startWith, tap } from 'rxjs/operators'
import log from './console'

export default componentFromStream(Counter, newCounterOperator)
// shorthand for backwards-compatible:
// componentFromStream(pipe(newCounterOperator(), map(Counter)))

function newCounterOperator () {
  const diff$ = new Subject<number>()
  const onClickIncrement = () => diff$.next(1)
  const onClickDecrement = () => diff$.next(-1)

  const count$ = diff$.pipe(
    startWith(0),
    scan((count, n) => count + n, 0)
  )

  return pipe(
    combineLatest(count$),
    map(([ props, count ]) => ({
      count,
      onClickIncrement,
      onClickDecrement,
      ...props
    } as CounterProps)),
    tap<CounterProps>(log('view-props:'))
  )
}