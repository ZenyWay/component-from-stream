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
import { ButtonViewProps } from './view'
import { shallowMerge, pick, toProp, shallowEqual } from '../utils'
import log from '../console'
import { into } from 'basic-cursors'
import { Observable, combineLatest, from, merge, empty } from 'rxjs'
import {
  catchError,
  delay,
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  pluck,
  share,
  startWith,
  switchMap,
  tap
} from 'rxjs/operators'
import withEventHandler from 'rx-with-event-handler'
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

export default function (
  props$: Observable<CopyButtonProps>
): Observable<ButtonViewProps> {
  return props$.pipe(
    map(shallowMerge(DEFAULT_PROPS)), // icons are not deep-copied
    tap(log('copy-button:props:')),
    withEventHandler('click')(switchMap(doCopyToClipboard)),
    withToggleDisabledOnSuccess,
    tap(log('copy-button:toggle-disable-on-success:')),
    pickDistinct('disabled', 'onClick', 'icons'), // clean-up
    map(into('icon')(iconFromDisabled)),
    distinctUntilChanged<ButtonViewProps>(shallowEqual), // only render when necessary
    tap(log('copy-button:view-props:')),
  )
}

function doCopyToClipboard
<P extends { event: E, value: string }, E extends { payload: MouseEvent }>(
  props: P
): Observable<P & { success: true }> {
  const { event, value } = props
  event.payload.preventDefault()
  return from(copyToClipboard(value)).pipe(
    mapTo({ ...(<object>props), success: true } as P & { success: true }),
    catchError(empty)
  )
}

function withToggleDisabledOnSuccess(props$) {
  const _props$ = props$.pipe(share())
  const timeout$ = _props$.pipe(pluck('timeout'), distinctUntilChanged())
  const disable$ = _props$.pipe(pluck('success'), filter(Boolean), share())
  const enable$ = timeout$.pipe(switchMap(lag(disable$)), startWith(true)) // stateful
  const disabled$ = merge(enable$.pipe(mapTo(false)), disable$)

  return combineLatest(
    _props$,
    disabled$.pipe(map(toProp('disabled'))),
    shallowMerge()
  )
}

function pickDistinct <P={}>(...keys: (keyof P)[]) {
	return function (props$: Observable<P>): Observable<Pick<P, keyof P>> {
    return props$.pipe(map(pick(...keys)), distinctUntilChanged(shallowEqual))
  }
}

function iconFromDisabled ({ disabled, icons }: any) {
  return disabled ? icons.disabled : icons.enabled
}

function lag <S>(source$: Observable<S>) {
  return function (timeout: number) {
    return source$.pipe(delay(timeout))
  }
}
