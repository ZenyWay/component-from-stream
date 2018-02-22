/**
 * @license
 * Copyright 2018-present, Stephane M. Catala
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http: *www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 *
 * derived from recompose (https: *github.com/acdlite/recompose):
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
 *
 * Component type definition derived from 'Type definitions for React 16.0'
 * https://github.com/DefinitelyTyped/DefinitelyTyped/types/react
 * Definitions by: Asana <https://asana.com>
 *                 AssureSign <http://www.assuresign.com>
 *                 Microsoft <https://microsoft.com>
 *                 John Reilly <https://github.com/johnnyreilly>
 *                 Benoit Benezech <https://github.com/bbenezech>
 *                 Patricio Zavolinsky <https://github.com/pzavolinsky>
 *                 Digiguru <https://github.com/digiguru>
 *                 Eric Anderson <https://github.com/ericanderson>
 *                 Albert Kurniawan <https://github.com/morcerf>
 *                 Tanguy Krotoff <https://github.com/tkrotoff>
 *                 Dovydas Navickas <https://github.com/DovydasNavickas>
 *                 Stéphane Goetz <https://github.com/onigoetz>
 *                 Rich Seviora <https://github.com/richseviora>
 *                 Josh Rutherford <https://github.com/theruther4d>
 *
 * Definitions apply to project: http://facebook.github.io/react/
 * MIT License
 *
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
;
import createSubject, { Observable, Subscription } from 'rx-subject'
import compose from './compose'

export { compose }

export type ComponentFromStreamFactory<N={},C={}> = <P={},Q=P>(
  render: (props: Q) => N,
  mapProps?: RxOperator<P, Q>
) => ComponentFromStreamConstructor<N, C, P, Q>

export interface ComponentFromStreamConstructor<N={},C={},P={},Q=P> {
  new (props: P, context?: any): C & ComponentFromStream<N,P,Q>
  lift <R>(
    fromOwnProps: (props: Observable<R>) => Observable<P>
  ): ComponentFromStreamConstructor<N,C,R,Q>
}

export interface ComponentFromStream<N={},P={},Q=P>
extends Component<N,P,ViewPropsState<Q>> {
  props$: Observable<Readonly<P>>
  componentWillMount (): void
  componentWillReceiveProps (nextProps: Readonly<P>, nextContext: any): void
  componentWillUnmount (): void
  shouldComponentUpdate (
    nextProps: Readonly<P>,
    nextState: Readonly<ViewPropsState<Q>>
  ): boolean
}

export interface ComponentConstructor<N={},P={}> {
  new (props: P, context?: any): Component<N,{},{}>
}

export interface Component<N={},P={},S={}> {
  setState<K extends keyof S> (state: Pick<S, K> | S, cb?: () => void): void
  render(): N
  props: Readonly<P>
  state: Readonly<S>
}

export interface ViewPropsState<Q> {
  viewProps: Q
}

export type RxOperator<I,O> = (props$: Observable<I>) => Observable<O>

export default function createComponentFromStreamFactory <N={},C={}>(
  ComponentCtor: new (props: any, context?: any) => C & Component<N,{},{}>,
  fromESObservable: <T>(stream: Observable<T>) => Observable<T>,
  toESObservable: <T>(stream: Observable<T>) => Observable<T> = identity
): ComponentFromStreamFactory<N,C> {
  return function createComponentFromStream <P,Q=P>(
    render: (props: Q) => N,
    mapProps: RxOperator<P,Q> = identity as any
  ): ComponentFromStreamConstructor<N,C,P,Q> {
    return class ComponentFromStreamClass
    extends (ComponentCtor as ComponentConstructor<N,P>) // base class cannot be generic
    implements ComponentFromStream<N,P,Q> {
      static lift <R=P>(op: RxOperator<R,P>): ComponentFromStreamConstructor<N, C, R, Q>
      static lift <R=P>(...ops: RxOperator<any,any>[]) {
        return createComponentFromStream<R,Q>(render, compose(mapProps, ...ops))
      }

      state = {} as Readonly<ViewPropsState<Q>> // view props

      props: Readonly<P> // own props

      private _props = createSubject<Readonly<P>>()

      props$ = this._props.source$

      render() {
        return !this.state.viewProps ? null : render(this.state.viewProps)
      }

      componentWillMount() {
        this._subscription = this._viewProps$.subscribe(
          this._setViewProps,
          this._unsubscribe,
          this._unsubscribe
        )
        this._props.sink.next(this.props)
      }

      componentWillReceiveProps(nextProps: Readonly<P>) {
        this._props.sink.next(nextProps)
      }

      componentWillUnmount () {
        this._props.sink.complete()
      }

      shouldComponentUpdate(_: any, nextState: Readonly<ViewPropsState<Q>>) {
        return nextState.viewProps !== this.state.viewProps
      }

      private _subscription: Subscription

      private _unsubscribe = () => this._subscription.unsubscribe()

      private _setViewProps =
        (viewProps: Readonly<Q>) => this.setState({ viewProps })

      // not shared: simultaneously subscribed at most once (when mounted)
      private _viewProps$ = toESObservable(mapProps(fromESObservable(this.props$)))
    } as any // retrofit back generic from base class
  }
}

function identity <T>(val: T): T {
  return val
}
