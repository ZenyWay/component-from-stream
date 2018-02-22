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
import InputGroupWithButton, { InputGroupViewProps } from './view'
import withInputGroupBehaviour, { InputGroupWithButtonProps } from './behaviour'
import { shallowEqual } from '../utils'
import createComponentFromStreamFactory, {
  ComponentFromStreamConstructor
} from '../../'
import { VNode, Component } from 'inferno'
import { from } from 'rxjs/observable/from'
import { distinctUntilChanged } from 'rxjs/operators'


const componentFromStream = createComponentFromStreamFactory(Component, from)

export default componentFromStream<InputGroupViewProps>(
  InputGroupWithButton,
  distinctUntilChanged<InputGroupViewProps>(shallowEqual)
).lift<InputGroupWithButtonProps>(withInputGroupBehaviour) as
ComponentFromStreamConstructor<VNode,Component<any,any>,InputGroupWithButtonProps,InputGroupViewProps>