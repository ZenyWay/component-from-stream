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

import renderButton, { ButtonProps } from './view'
import withCopyButtonBehaviour, { CopyButtonProps } from './behaviour'
import createComponentFromStreamFactory, {
  ComponentFromStreamConstructor
} from '../src'
import { VNode, Component } from 'inferno'
import { Observable } from 'rxjs'
import { distinctUntilChanged } from 'rxjs/operators'

const componentFromStream = createComponentFromStreamFactory(
  Component,
  Observable.from
)

export default componentFromStream<ButtonProps,ButtonProps>(
  renderButton,
  distinctUntilChanged<ButtonProps>(shallowEqual) // only render when necessary
).lift<CopyButtonProps>(withCopyButtonBehaviour) as
ComponentFromStreamConstructor<VNode,Component<any,any>,CopyButtonProps,ButtonProps>

function shallowEqual(a: any, b: any) {
  const akeys = Object.keys(a)
  const bkeys = Object.keys(b)

  return akeys.length === bkeys.length && akeys.every(isEqualValues)

  function isEqualValues (key: string) {
    return a[key] === b[key]
  }
}