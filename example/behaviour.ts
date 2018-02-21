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
import { compose, Operator } from '../src'
import { Observable } from 'rxjs/Observable'
import { combineLatest } from 'rxjs/observable/combineLatest'
import { merge } from 'rxjs/observable/merge'
import {
	delay, distinctUntilChanged, filter, map, mapTo, pluck, share, startWith,
	switchMap, tap
} from 'rxjs/operators'
import withEventHandlerProps from 'rx-with-event-handler-props'
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

export default compose(
  tap(log('view-props:')),
  map(pick<keyof ButtonProps>('disabled', 'onClick', 'icon')),
  map(withIconFromDisabled),
  tap(log('with-toggle-disabled-on-success:')),
  withToggleDisabledOnSuccess,
  map(withCopyOnClick),
  tap(log('with-event-handler-props:')),
  withEventHandlerProps('click'),
  map(withDefaultProps)
) as Operator<CopyButtonProps,ButtonProps>

function withDefaultProps (props: Partial<CopyButtonProps>): CopyButtonProps {
  const icons = { ...DEFAULT_PROPS.icons, ...(props && props.icons) }
  return { ...DEFAULT_PROPS, ...props, icons }
}

function withCopyOnClick (props: any) {
  return !props || !props.event || props.event.id !== 'click'
    ? props
    : { ...props, success: copyOnClick(props.event.payload, props.value) }
}

function copyOnClick(event, value) {
  event.preventDefault()
  return copyToClipboard(value) //true on success
}

function withToggleDisabledOnSuccess(props$) {
  const _props$ = props$.pipe(share())
  const timeout$ = _props$.pipe(pluck('timeout'), distinctUntilChanged())
  const disable$ = _props$.pipe(pluck('success'), share())
  const enable$ = timeout$.pipe(switchMap(lag(disable$)), startWith(true)) // stateful
  const disabled$ = merge(enable$.pipe(mapTo(false)), disable$)

  return combineLatest(
    _props$,
    disabled$.pipe(map(toProp('disabled'))),
    shallowMerge
  )
}

function withIconFromDisabled (props: any) {
  const { disabled = false, icons } = props
  const icon = disabled ? icons.disabled : icons.enabled
  return { ...props, disabled, icon }
}

function pick <K extends string>(...keys: K[]) {
  return function <T extends Partial<{ [P in K]: T[P] }>>(obj: T): Pick<T,K> {
    return keys.reduce(addEntry, {})

    function addEntry (selected, key) {
      if (key in obj) { selected[key] = obj[key] }
      return selected
    }
  }
}

function lag <S>(source$: Observable<S>) {
  return function (timeout: number) {
    return source$.pipe(delay(timeout))
  }
}

function shallowMerge <T>(...props: any[]): T {
  return Object.assign({}, ...props)
}

function toProp (key: string) {
  return function <T>(val: T) {
    return { [key]: val }
  }
}

/*
function isHidden({ hidden, value }) {
  return !!hidden || !value
}
*/

function log (label: string): (...args: any[]) => void {
  return console.log.bind(console, label)
}
