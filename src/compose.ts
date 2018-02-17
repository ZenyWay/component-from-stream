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
import { Observable } from './subject'

/**
 * @return an Operator that applies the given operators from right to left.
 */
export default
function compose<I,O>(...ops: ((val: any) => any)[]): (val: I) => O {
  return function (val: I) {
    return ops.reduceRight(apply, val)
  }
}

function apply(obj: any, fn: Function) {
  return fn(obj)
}
