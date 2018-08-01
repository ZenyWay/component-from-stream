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
  <P={}>(
    operator: Operator<P,N>
  ): ComponentFromStreamConstructor<C,N>
  <P={},Q=P>(
    render: (props: Q) => N,
    factory: OperatorFactory<P,P,Q>
  ): ComponentFromStreamConstructor<C,N>
  <P={},Q=P,A=P>(
    render: (props: Q) => N,
    project: Mapper<P,A>,
    operator: OperatorFactory<A,A,any>,
    ...operators: OperatorFactory<A,any,any>[]
  ): ComponentFromStreamConstructor<C,N>
}

export interface ComponentFromStreamOptions {}

export interface ComponentFromStreamConstructor<C extends Component<N,any,any>,N> {
  new <P={},Q=P>(props?: P, context?: any): C & ComponentFromStream<N,P,Q>
}

export interface ComponentFromStream<N,P={},Q=P>
extends Component<N,P,PropsState<Q>> {
  componentDidMount (): void
  componentWillReceiveProps (nextProps: Readonly<P>, nextContext: any): void
  componentWillUnmount (): void
  shouldComponentUpdate (
    props: Readonly<P>,
    state: Readonly<PropsState<Q>>
  ): boolean
}

export interface ComponentConstructor<N> {
  new <P={},S={}>(props: P, context?: any): Component<N,P,S>
}

export interface Component<N,P={},S={}> {
  setState (state: Reducer<S,P> | Partial<S>, cb?: () => void): void
  render(props?: P, state?: S, context?: any): N|void
  props: Readonly<P>
  state: Readonly<S|null>
  context: any
}

export interface PropsState<Q> { props: Q }

export type Mapper<P,A=P> = (props: P) => A

export type OperatorFactory<
  A=void,
  I={},
  O=I,
  Q extends Subscribable<I> = Subscribable<I>,
  S extends Subscribable<O> = Subscribable<O>
> = (
  dispatch?: StreamableDispatcher<A>,
  fromESObservable?: <T, O extends Subscribable<T>>(stream: Subscribable<T>) => O,
  toESObservable?: <T, O extends Subscribable<T>>(stream: O) => Subscribable<T>
) => Operator<I,O,Q,S>

export type Operator<
  I={},
  O=I,
  Q extends Subscribable<I> = Subscribable<I>,
  S extends Subscribable<O> = Subscribable<O>
> = (q$: Q) => S

export interface StreamableDispatcher<A,S extends Subscribable<A> = Subscribable<A>> {
  next (val: A): void
  from <E extends Subscribable<A>>(source$: E): void
  source$: S
}

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
  toES = identity as (<T, O extends Subscribable<T>>(stream: O) => Subscribable<T>)|Partial<ComponentFromStreamOptions>,
  opts = {} as Partial<ComponentFromStreamOptions>
): ComponentFromStreamFactory<C,N> {
  return typeof toES !== 'function'
  ? createComponentFromStreamFactory(
      ComponentCtor,
      fromES,
      void 0, // toESObservable
      toES // opts
    )
  : function createComponentFromStream <P={},A=P,Q=P,S=void>(
    render: ((props: Q) => N)|Operator<P,N>,
    project?: Mapper<P,A>|OperatorFactory<P,P,Q>,
    ...factories: OperatorFactory<A,any,any>[]
  ): ComponentFromStreamConstructor<C,N> {
    for (const arg of arguments) {
      if (typeof arg !== 'function') {
        throw new TypeError()
      }
    }
    switch (arguments.length) {
      case 0:
        throw new TypeError()
      case 1:
        return createComponentFromStream(
          identity as Operator<P,N>,
          identity as Mapper<P,A>,
          (() => render) as OperatorFactory<any,P,N>
        )
      case 2:
        return createComponentFromStream(
          render,
          identity as Mapper<P,P>,
          project as OperatorFactory<P,P,Q>
        )
      default:
    }
    return class ComponentFromStreamClass
      extends (ComponentCtor as ComponentConstructor<N>)
      implements ComponentFromStream<N,P,Q> {

      state = {} as Readonly<PropsState<Q>> // view props

      props: Readonly<P> // own props

      private _q: Subject<A>

      private _dispatch: (v: A) => void
      private _onProps = (props: P) => this._dispatch((<Mapper<P,A>>project)(props))
      private _setProps = (props: Readonly<Q>) => this.setState({ props })

      private _subs = [] as Subscription[]

      render() {
        return !this.state.props
          ? null
          : (render as (props: Q) => N)(this.state.props)
      }

      /**
       * this method sets up the reactive chains and corresponding subscription
       * => it should only be called once, after instantiation
       */
      componentDidMount() {
        const q = (this._q = createSubject())
        const source$ = fromES(q.source$)
        const stack = [] as Subscribable<A>[]
        const dispatch: StreamableDispatcher<A> = {
          next: q.sink.next,
          from: Array.prototype.push.bind(stack),
          source$
        }
        let props$: Subscribable<any> = source$
        for (const factory of factories) {
          props$ = factory(dispatch, fromES, toES)(props$)
        }
        this._subs = [toES(props$).subscribe(this._setProps)]
        for (const dispatch$ of stack) {
          this._subs.push(toES(dispatch$).subscribe(q.sink))
        }
        this._dispatch = dispatch.next
        this._onProps(this.props)
      }

      /**
       * this method will be deprecated in React@17,
       * replaced with UNSAFE_componentWillReceiveProps.
       * keeping both for other frameworks.
       */
      componentWillReceiveProps = this._onProps
      UNSAFE_componentWillReceiveProps = this._onProps

      componentWillUnmount () {
        this._q.sink.complete()
        for (const sub of this._subs) {
          sub.unsubscribe()
        }
        delete this._subs
        delete this._q
      }

      shouldComponentUpdate(_: any, state: Readonly<PropsState<Q>>) {
        return state.props !== this.state.props
      }
    } as ComponentFromStreamConstructor<any,N>
  }
}

export function identity <T>(v: T): T {
  return v
}
