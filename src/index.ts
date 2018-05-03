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
    dispatch?: DispatcherFactory<P,A>
  ): ComponentFromStreamConstructor<C,N>
  <P={},A=P,Q=P,S=void>(
    render: (props: Q) => N,
    operator: Operator<S,Q>,
    dispatch: DispatcherFactory<P,A>,
    reducer: Reducer<S,A>,
    ...effects: Effect<S,A>[]
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
  (source$: S, next?: (val: I) => void) => T

export type DispatcherFactory<P,A=P> = <S extends Subscribable<A>>
  (dispatch: (v: A) => void, source$?: S) => (props: P) => void

export type Reducer<A,V> = (acc: A, val: V) => A

export type Effect<S,A> =
  (action$: Subscribable<A>, state$?: Subscribable<S>) => Subscribable<A>

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
  fromESObservable: <T, O extends Subscribable<T>>(stream: Subscribable<T>) => O,
  toESObservableOrOpts = identity as (<T, O extends Subscribable<T>>(stream: O) => Subscribable<T>)|Partial<ComponentFromStreamOptions>,
  opts = {} as Partial<ComponentFromStreamOptions>
): ComponentFromStreamFactory<C,N> {
  if (!isFunction(toESObservableOrOpts)) {
    return createComponentFromStreamFactory(
      ComponentCtor,
      fromESObservable,
      void 0, // toESObservable
      toESObservableOrOpts // opts
    )
  }
  const toESObservable = toESObservableOrOpts

  return function createComponentFromStream <P={},A=P,Q=P,S=void>(
    render: (props: Q) => N,
    operator: Operator<A|S,Q> = identity as Operator<A,Q>,
    dispatch = identity as DispatcherFactory<P,A>,
    reducer?: Reducer<S,A>,
    ...effects: Effect<S,A>[]
  ): ComponentFromStreamConstructor<C,N> {
    abstract class ComponentFromStreamBaseClass
      extends (ComponentCtor as ComponentConstructor<N>)
      implements ComponentFromStream<N,P,Q> {

      state = {} as Readonly<ViewPropsState<Q>> // view props

      props: Readonly<P> // own props

      protected _inputs = createSubject<A>()
      protected _input$ = fromESObservable(this._inputs.source$)
      protected _onInput: (val: any) => void = function () {}

      protected _onProps = dispatch(this._inputs.sink.next, this._input$)
      protected _setProps =
        (props: Readonly<Q>) => this.setState({ props })
      // not shared: simultaneously subscribed at most once (when mounted)
      protected _props$: Subscribable<Q>

      render() {
        return !this.state.props ? null : render(this.state.props)
      }

      protected _subs = [] as Subscription[]
      protected _subscribe () { // should always be called first by overriding subclasses
        this._subs.push(this._props$.subscribe(this._setProps))
      }
      protected _unsubscribe = () => this._subs.forEach(unsubscribe)

      componentWillMount() {
        this._subscribe()
        // unsubscribe on complete from componentWillUnmount or error
        this._inputs.source$.subscribe( // no need to unsubscribe this one
          this._onInput, // hook for mapping input values
          this._unsubscribe, // takeUntil(input$.pipe(last()))
          this._unsubscribe // takeUntil(input$.pipe(last()))
        )
        this._onProps(this.props)
      }

      componentWillReceiveProps(props: Readonly<P>) {
        this._onProps(props)
      }

      componentWillUnmount () {
        this._inputs.sink.complete()
      }

      shouldComponentUpdate(_: any, state: Readonly<ViewPropsState<Q>>) {
        return state.props !== this.state.props
      }
    }

    return !reducer
      ? class ComponentFromStreamClass
          extends ComponentFromStreamBaseClass
          implements ComponentFromStream<N,P,Q> {

          protected _props$ = toESObservable<Q, Subscribable<Q>>(operator(this._input$))
      }
      : class ComponentFromReduxStreamClass
          extends ComponentFromStreamBaseClass
          implements ComponentFromStream<N,P,Q> {

          protected _state?: S
          protected _onInput = (action: A) => this._states.sink.next(
            this._state = reducer(this._state, action)
          )
          protected _states: Subject<A|S> = createSubject<S>()
          protected _state$ = fromESObservable(this._states.source$)

          protected _props$ = toESObservable<Q, Subscribable<Q>>(operator(this._state$))

          protected _effects = effects.map(
            (effect: Effect<S,A>) => effect(this._input$, this._state$ as Subscribable<S>)
          )

          protected _subscribeEffect = (effect$: Subscribable<A>) =>
            this._subs.push(effect$.subscribe(this._inputs.sink.next))

          protected _subscribe () {
            super._unsubscribe()
            this._effects.forEach(this._subscribeEffect)
            this._state = void 0
          }
        } as ComponentFromStreamConstructor<any,N>
  }
}

function unsubscribe(sub: Subscription) {
  sub.unsubscribe()
}

function isFunction (v: any): v is Function {
  return typeof v === 'function'
}

function identity <T>(val: T): T {
  return val
}
