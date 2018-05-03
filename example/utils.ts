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
import { Observable, merge } from 'rxjs'
import { partition } from 'rxjs/operators'

export type RxOperator<I,O> = ($: Observable<I>) => Observable<O>

export function when <I,O>(predicate: (v: I) => boolean) {
  return function (
    onTrue: RxOperator<I,O>,
    onFalse = identity as RxOperator<I,O>
  ): RxOperator<I,O> {
    return function ($: Observable<I>) {
      const [true$, false$] = partition(predicate)($)
      return merge(onFalse(false$), onTrue(true$))
    }
  }
}

export function hasEvent (id: string): <O extends object>(o: O) => boolean {
  return function ({ event }: any) {
    return event && event.id === id
  }
}

export function shallowEqual(a: any, b: any) {
  if(a === b) { return true }
  const akeys = Object.keys(a)
  const bkeys = Object.keys(b)

  return akeys.length === bkeys.length && akeys.every(isEqualValues)

  function isEqualValues (key: string) {
    return a[key] === b[key]
  }
}

export function shallowMerge(...defs) {
  return function(...objs) {
    return Object.assign({}, ...defs, ...objs)
  }
}

export function pick <K extends string>(...keys: K[]) {
  return function <T extends Partial<{ [P in K]: T[P] }>>(obj: T): Pick<T,K> {
    return keys.reduce(addEntry, {})

    function addEntry (selected, key) {
      if (key in obj) { selected[key] = obj[key] }
      return selected
    }
  }
}

export function toProp (key: string) {
  return function <T>(val: T) {
    return { [key]: val }
  }
}

export function identity <V>(v: V): V { return v }
