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
import createComponentFromStreamFactory, {
  ComponentFromStreamFactory,
  ComponentFromStreamConstructor,
  Operator as GenericOperator,
  DispatchOperator as GenericDispatchOperator
} from '../'
import { InfernoChildren, Component } from 'inferno'
import { from, Observable } from 'rxjs'

export {
  ComponentFromStreamFactory,
  ComponentFromStreamConstructor,
  Component,
  InfernoChildren
}

export type Operator<I={},O=I> = GenericOperator<I,O,Observable<I>,Observable<O>>
export type DispatchOperator<A=void,I={},O=I> =
  GenericDispatchOperator<A,I,O,Observable<I>,Observable<O>>

export default createComponentFromStreamFactory<Component<any,any>,InfernoChildren>(
  Component,
  from
)

export function compose <I,O>(...operators: Operator<any,any>[]): Operator<I,O> {
  return function (q$: Observable<I>): Observable<O> {
    return q$.pipe(...operators)
  }
}
