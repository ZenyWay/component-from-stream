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
  Operator as GenericOperator,
  OperatorFactory as GenericOperatorFactory
} from '../'
import { Component } from 'inferno'
import { from, Observable } from 'rxjs'

// component-from-stream factory based on Inferno and RxJS
export default createComponentFromStreamFactory(Component, from)

// helper for composing operators
export function pipe <I,O>(...operators: Operator<any,any>[]): Operator<I,O> {
  return function (q$: Observable<I>): Observable<O> {
    return (q$.pipe as Function)(...operators)
  }
}

// Observable-specific helper types
export type Operator<I={},O=I> = GenericOperator<I,O,Observable<I>,Observable<O>>
export type OperatorFactory<A=void,I={},O=I> =
  GenericOperatorFactory<A,I,O,Observable<I>,Observable<O>>
