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
import { Component } from 'inferno'
import { createElement } from 'inferno-create-element'

export interface InputGroupViewProps {
  type: string,
  value: string,
  onInput: (event: any) => void,
  children: AddonButton,
  placeholder: string,
  disabled: boolean
}

export type AddonButton = Component<{ value: string }, any>

export default function renderInputGroupWithButton({
  type = 'text',
  value = '',
  onInput,
  children,
  placeholder = 'enter some text',
  disabled = false
}) {
  const Button = children
  const ButtonAddon = !Button ? null : (
    <div class="input-group-prepend">
      <Button value={value} />
    </div>
  )

  return (
    <div class="input-group">
      {ButtonAddon}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onInput={onInput}
        disabled={disabled}
      />
    </div>
  )
}
