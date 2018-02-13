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
 *
 * based on createEventHandler from
 * recompose (https://github.com/acdlite/recompose)
 * The MIT License (MIT)
 * Copyright (c) 2015-2016 Andrew Clark
 *
 * Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { createChangeEmitter } from 'change-emitter'
import $$observable from 'symbol-observable'

export type Subject<T> = Observable<T> & Observer<T>

export interface Observer<T> {
  next (val: T): void
  error (error: any): void
  complete (): void
}

export interface Observable<T> {
	subscribe(observer: Observer<T>): Subscription
  subscribe (
		next: (val: T) => void,
  	error: (error: any) => void,
		complete: () => void
	): Subscription
}

export interface Subscription {
  unsubscribe (): void
}

interface Emitter<T> {
  emit (name: string, ...args: any[]): void
  listen (handler: (name: string, ...args: any[]) => void): () => void
}

export default function createSubject <T>(): Subject<T> {
	const { emit, listen }: Emitter<T> = createChangeEmitter()

	return {
		next (this: void, val) {
			emit('next', val)
		},
		error (this: void, error) {
			emit('error', error)
		},
		complete (this: void, ) {
			emit('complete')
		},
		subscribe (
			this: void,
			observerOrNext: Observer<T>|((val: T) => void),
  		error?: (error: any) => void,
			complete?: () => void
		) {
			let done = false
			const observer = typeof observerOrNext !== 'function'
			? observerOrNext
			: { next: observerOrNext, error, complete }

			return {
				unsubscribe: listen(observe)
			}

			function observe(key: keyof Observer<T>, val?: any) {
				if (done) { return }
				if (key !== 'next') { done = true }
				(observer[key] as (val?: any) => void)(val) // throws if unknown key
			}
		},
		[$$observable](): Observable<T> {
			return this
		}
	}
}
