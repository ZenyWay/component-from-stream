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
import { VNode } from 'inferno'
import { createElement } from 'inferno-create-element'

export interface ButtonViewProps {
  disabled: boolean
  onClick: (event: any) => void
  icon
}

export default function render (
  { disabled = false, onClick = false, icon = 'fa-question' }: ButtonViewProps
): VNode {
  return (
    <button
      className="btn btn-outline-secondary"
      onClick={onClick}
      disabled={disabled}>
      <i className={`fa fa-fw ${icon}`} />
    </button>
  )
}
