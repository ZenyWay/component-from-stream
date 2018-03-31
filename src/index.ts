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

export interface ComponentFromStreamFactory<N={},C={}> {
  <P={},Q=P>(
    render: (props: Q) => N,
    behaviour?: RxOperator<P,Q>
  ): ComponentFromStreamConstructor<N, C, P, Q>
  <P={},A=P,Q=P>(
    render: (props: Q) => N,
    behaviour: Partial<BehaviourSpec<P,A,Q>>
  ): ComponentFromStreamConstructor<N, C, P, Q>
}

export interface ComponentFromStreamConstructor<N={},C={},P={},Q=P> {
  new (props: P, context?: any): C & ComponentFromStream<N,P,Q>
}

export interface ComponentFromStream<N={},P={},Q=P>
extends Component<N,P,ViewPropsState<Q>> {
  _source$: Observable<Readonly<P>>
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
  props: Q
}

export interface BehaviourSpec<P,A,Q> {
  dispatcher: DispatcherFactory<P,A>
  operator?: RxOperator<A,Q>
}

export type DispatcherFactory<P,A=P> =
(dispatch: (v: A) => void, source$?: Observable<A>) => (props: P) => void

export type RxOperator<I,O> = (props$: Observable<I>) => Observable<O>

export default function createComponentFromStreamFactory <N={},C={}>(
  ComponentCtor: new (props: any, context?: any) => C & Component<N,{},{}>,
  fromESObservable: <T>(stream: Observable<T>) => Observable<T>,
  toESObservable: <T>(stream: Observable<T>) => Observable<T> = identity
): ComponentFromStreamFactory<N,C> {
  return function createComponentFromStream <P,Q=P>(
    render: (props: Q) => N,
    behaviour: RxOperator<P,Q>|Partial<BehaviourSpec<P,any,Q>> = identity as any
  ): ComponentFromStreamConstructor<N,C,P,Q> {
    const {
      dispatcher = identity as DispatcherFactory<P,any>,
      operator = identity as RxOperator<any,Q>
    } = isFunction(behaviour) ? { operator: behaviour } : behaviour

    return class ComponentFromStreamClass
    extends (ComponentCtor as ComponentConstructor<N,P>) // base class cannot be generic
    implements ComponentFromStream<N,P,Q> {
      state = {} as Readonly<ViewPropsState<Q>> // view props

      props: Readonly<P> // own props

      private _dispatcher = createSubject<Readonly<P>>()

      _source$ = fromESObservable(this._dispatcher.source$)

      _onProps = dispatcher(this._dispatcher.sink.next, this._source$)

      render() {
        return !this.state.props ? null : render(this.state.props)
      }

      componentWillMount() {
        this._subscription = this._props$.subscribe(
          this._setProps,
          this._unsubscribe,
          this._unsubscribe
        )
        this._onProps(this.props)
      }

      componentWillReceiveProps(nextProps: Readonly<P>) {
        this._onProps(nextProps)
      }

      componentWillUnmount () {
        this._dispatcher.sink.complete()
      }

      shouldComponentUpdate(_: any, nextState: Readonly<ViewPropsState<Q>>) {
        return nextState.props !== this.state.props
      }

      private _subscription: Subscription

      private _unsubscribe = () => this._subscription.unsubscribe()

      private _setProps =
        (props: Readonly<Q>) => this.setState({ props })

      // not shared: simultaneously subscribed at most once (when mounted)
      private _props$ = toESObservable(operator(this._source$))
    } as any // retrofit back generic from base class
  }
}

function isFunction (v: any): v is Function {
  return typeof v === 'function'
}

function identity <T>(val: T): T {
  return val
}
