
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
;
import { createElement } from 'inferno-create-element'

export interface ButtonProps {
  active: boolean
  block: boolean
  className: string
  color: 'primary'|'secondary'|'success'|'info'|'warning'|'danger'|'link'
  outline: boolean
  size: string
  [attr: string]: any
}
export default function Button({
	active,
	block,
	className,
	color = 'primary',
	outline,
	size,
	...attrs
}: Partial<ButtonProps>) {
	const { href, onClick, disabled } = attrs
	const Tag = href ? 'a' : 'button'
	const btnType = !href && onClick ? 'button' : undefined
	const classes = [
		className,
		'btn',
		`btn${outline ? '-outline' : ''}-${color}`,
		size ? `btn-${size}` : '',
		block ? 'btn-block' : '',
		active ? 'active' : '',
		disabled ? 'disabled' : ''
	].join(' ')

	return (
		<Tag type={btnType} className={classes} {...attrs} />
	)
}
