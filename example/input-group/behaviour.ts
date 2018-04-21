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
import { InputGroupViewProps, AddonButton } from './view'
import log from '../console'
import compose from 'basic-compose'
import { Operator } from '../../src'
import withEventHandler from 'rx-with-event-handler'
import { into } from 'basic-cursors'
import { pick, when, hasEvent, shallowEqual } from '../utils'
import { distinctUntilChanged, map, tap } from 'rxjs/operators'

export interface InputGroupWithButtonProps {
  type: string,
  onInput: (event: any) => void,
  children: AddonButton,
  placeholder: string,
  disabled: boolean
}

const VIEW_PROPS = [
  'type', 'value', 'onInput', 'children', 'placeholder', 'disabled'
] as (keyof InputGroupViewProps)[]

export default compose(
  tap(log('input-group-with-button:view-props:')),
  distinctUntilChanged<InputGroupViewProps>(shallowEqual),
  map(pick<keyof InputGroupViewProps>(...VIEW_PROPS)), // clean-up
  withEventHandler('input')(map(into('value')(valueFromInputEvent)))
) as Operator<InputGroupWithButtonProps,InputGroupViewProps>

function valueFromInputEvent({ event }) {
  return event.payload.target.value
}
