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

import { ButtonProps } from './view'
import { combine, Operator } from '../src'
import { Observable, Subject } from 'rxjs'
import { map } from 'rxjs/operators'
import copyToClipboard = require('clipboard-copy')

export const DEFAULT_PROPS: CopyButtonProps = {
  value: '',
  timeout: 500, // ms
  icons: {
    disabled: 'fa-check',
    enabled: 'fa-copy'
  }
}

export interface CopyButtonProps {
  value: string
  timeout: number
  icons: ButtonIcons
}

export interface ButtonIcons {
  disabled: string, enabled: string
}

interface OnClickProps {
  onClick: (event: any) => void
  event?: any
}

export default combine(
  map(selectEntries<keyof ButtonProps>('disabled', 'onClick', 'icon')),
  map(withToggleIconWhenDisabled),
  withToggleDisabledOnSuccess,
  map(withCopyOnClick),
  withEventEmitter('onClick'),
  map(withDefaultProps)
) as Operator<CopyButtonProps,ButtonProps>

function withDefaultProps (props: Partial<CopyButtonProps>): CopyButtonProps {
  const icons = { ...DEFAULT_PROPS.icons, ...(props && props.icons) }
  return { ...DEFAULT_PROPS, ...props, icons }
}

type Emitter<V> = (val?: V) => void

function withEventEmitter <E extends { [name: string]: Emitter<any> }>(
  name: keyof E
) {
  return function <P>(props$: Observable<P>): Observable<P&E&{ event?: any }> {
    const emitter$ = new Subject()
    const emitter = emitter$.next.bind(emitter$)
    const withEmitter$ = props$.map(addEmitterProp).share()
    const event$ = emitter$.map(toEntry('event'))
      .takeUntil(withEmitter$.last()) // unsubscribe when component will unmount

    return Observable.merge(
      withEmitter$,
      event$.withLatestFrom(withEmitter$, merge)
    ).do(log('with-event-handler:'))

    function addEmitterProp (props: any) {
      return { ...props, [name]: emitter }
    }
  }
}

function withCopyOnClick (props: any) {
  return !props || !props.event || props.event.type !== 'click'
    ? props
    : { ...props, success: copyOnClick(props) }
}

function copyOnClick({ event, value }) {
  event.preventDefault()
  return copyToClipboard(value) //true on success
}

function withToggleDisabledOnSuccess(props$) {
  const _props$ = props$.share()
  const timeout$ = pluckDistinct(_props$, 'timeout')
  const disable$ = pluckDistinct(_props$, 'success')
    .filter(Boolean)
    .share()
  const enable$ = timeout$.switchMap(delay(disable$)).startWith(true) // stateful
  const disabled$ = Observable.merge(enable$.mapTo(false), disable$).map(
    toEntry('disabled')
  )

  return Observable.combineLatest(_props$, disabled$, merge).do(
    log('with-toggle-disable-on-event:')
  )
}

function withToggleIconWhenDisabled (props: any) {
  const { disabled = false, icons } = props
  const icon = disabled ? icons.disabled : icons.enabled
  return { ...props, disabled, icon }
}

function selectEntries <K extends string>(...keys: K[]) {
  return function <T extends Partial<{ [P in K]: T[P] }>>(obj: T): Pick<T,K> {
    return keys.reduce(addEntry, {})

    function addEntry (selected, key) {
      if (key in obj) { selected[key] = obj[key] }
      return selected
    }
  }
}

function delay <S>(source$: Observable<S>) {
  return function (timeout: number) {
    return source$.delay(timeout)
  }
}

function merge <T>(...props: any[]): T {
  return Object.assign({}, ...props)
}

function toEntry (key: string) {
  return function <T>(val: T) {
    return { [key]: val }
  }
}

function pluckDistinct<S> (
  source$: Observable<S>,
  key: keyof S,
  comparator?: (a: any, b: any) => boolean
) {
  return source$.pluck(key).distinctUntilChanged(comparator)
}

/*
function isHidden({ hidden, value }) {
  return !!hidden || !value
}
*/

function log (label: string): (...args: any[]) => void {
  return console.log.bind(console, label)
}
