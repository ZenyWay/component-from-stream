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
import createSubject, { Subject, Subscribable, Subscription } from 'rx-subject'

export interface ComponentFromStreamFactory<C extends Component<N,any,any>,N> {
  <P={},Q=P,A=P>(
    render: (props: Q) => N,
    operator?: Operator<A,Q>,
    onprops?: PropsDispatcherFactory<P,A>
  ): ComponentFromStreamConstructor<C,N>
  <P={},A=P,Q=P,S=void>(
    render: (props: Q) => N,
    operator: Operator<S,Q>,
    onprops: PropsDispatcherFactory<P,A>,
    ...middlewares: Middleware<A>[]
  ): ComponentFromStreamConstructor<C,N>
}

export interface ComponentFromStreamOptions {}

export interface ComponentFromStreamConstructor<C extends Component<N,any,any>,N> {
  new <P={},Q=P>(props?: P, context?: any): C & ComponentFromStream<N,P,Q>
}

export interface ComponentFromStream<N,P={},Q=P>
extends Component<N,P,ViewPropsState<Q>> {
  componentWillMount (): void
  componentWillReceiveProps (nextProps: Readonly<P>, nextContext: any): void
  componentWillUnmount (): void
  shouldComponentUpdate (
    props: Readonly<P>,
    state: Readonly<ViewPropsState<Q>>
  ): boolean
}

export interface ComponentConstructor<N> {
  new <P={},S={}>(props: P, context?: any): Component<N,P,S>
}

export interface Component<N,P={},S={}> {
  setState (state: Reducer<S,P> | Partial<S>, cb?: () => void): void
  render(props?: P, state?: S, context?: any): N
  props: Readonly<P>
  state: Readonly<S|null>
  context: any
}

export interface ViewPropsState<Q> {
  props: Q
}

export type Operator<I,O> = <S extends Subscribable<I>,T extends Subscribable<O>>
  (source$: S) => T

export type PropsDispatcherFactory<P,A=P> = <S extends Subscribable<A>>
  (dispatch: (v: A) => void, source$?: S) => (props: P) => void

export type Middleware<I> = (
  dispatch: (...args: any[]) => void,
  source$?: Subscribable<I>,
  fromESObservable?: <T, O extends Subscribable<T>>(stream: Subscribable<T>) => O,
  toESObservable?: <T, O extends Subscribable<T>>(stream: O) => Subscribable<T>
) => (...args: any[]) => void

export type Reducer<A,V> = (acc: A, val: V) => A

export { Subscribable }

export default function createComponentFromStreamFactory <C extends Component<N,any,any>,N>(
  ComponentCtor: new (props: any, context?: any) => C & Component<N,any,any>,
  fromESObservable: <T, O extends Subscribable<T>>(stream: Subscribable<T>) => O,
  opts?: Partial<ComponentFromStreamOptions>
): ComponentFromStreamFactory<C,N>
export default function createComponentFromStreamFactory <C extends Component<N,any,any>,N>(
  ComponentCtor: new (props: any, context?: any) => C & Component<N,any,any>,
  fromESObservable: <T, O extends Subscribable<T>>(stream: Subscribable<T>) => O,
  toESObservable: <T, O extends Subscribable<T>>(stream: O) => Subscribable<T>,
  opts?: Partial<ComponentFromStreamOptions>
): ComponentFromStreamFactory<C,N>
export default function createComponentFromStreamFactory <C extends Component<N,any,any>,N>(
  ComponentCtor: new (props: any, context?: any) => C & Component<N,any,any>,
  fromES: <T, O extends Subscribable<T>>(stream: Subscribable<T>) => O,
  toESOrOpts = identity as (<T, O extends Subscribable<T>>(stream: O) => Subscribable<T>)|Partial<ComponentFromStreamOptions>,
  opts = {} as Partial<ComponentFromStreamOptions>
): ComponentFromStreamFactory<C,N> {
  if (!isFunction(toESOrOpts)) {
    return createComponentFromStreamFactory(
      ComponentCtor,
      fromES,
      void 0, // toESObservable
      toESOrOpts // opts
    )
  }
  const toES = toESOrOpts

  return function createComponentFromStream <P={},A=P,Q=P,S=void>(
    render: (props: Q) => N,
    operator: Operator<A|S,Q> = identity as Operator<A,Q>,
    onProps = identity as PropsDispatcherFactory<P,A>,
    ...middlewares: Middleware<A>[]
  ): ComponentFromStreamConstructor<C,N> {
    return class ComponentFromStreamBaseClass
      extends (ComponentCtor as ComponentConstructor<N>)
      implements ComponentFromStream<N,P,Q> {

      state = {} as Readonly<ViewPropsState<Q>> // view props

      props: Readonly<P> // own props

      render() {
        return !this.state.props ? null : render(this.state.props)
      }

      componentWillMount() {
        this._q = createSubject<A>()
        const q$ = fromES(this._q.source$)
        this._sub =
          toES<Q, Subscribable<Q>>(operator(q$)).subscribe(this._setProps)
        this._q.source$.subscribe(nop, this._unsubscribe, this._unsubscribe)
        const next =
          middlewares.reduceRight(this._applyMiddleware, this._q.sink.next)
        this._onProps = onProps(next, q$)
        this._onProps(this.props)
      }

      componentWillReceiveProps(props: Readonly<P>) {
        this._onProps(props)
      }

      componentWillUnmount () {
        this._q.sink.complete()
      }

      shouldComponentUpdate(_: any, state: Readonly<ViewPropsState<Q>>) {
        return state.props !== this.state.props
      }

      private _q: Subject<A>

      private _onProps: (props: P) => void
      private _setProps = (props: Readonly<Q>) => this.setState({ props })

      private _applyMiddleware = (
        next: (...args: any[]) => void,
        middleware: Middleware<A>
      ) => middleware(next, this._q.source$, fromES, toES)

      private _sub: Subscription
      private _unsubscribe = () => this._sub.unsubscribe()
    } as ComponentFromStreamConstructor<any,N>
  }
}

function isFunction (v: any): v is Function {
  return typeof v === 'function'
}

function identity <T>(val: T): T {
  return val
}

function nop () {}
