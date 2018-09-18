# component-from-stream on steroids (1k bytes gzip)
[![NPM](https://nodei.co/npm/component-from-stream.png?compact=true)](https://nodei.co/npm/component-from-stream/)

create a React-like component from any React-compatible library,
that sources its props from an observable stream.

backwards-compatible with, and based on [`component-from-stream`](https://github.com/acdlite/recompose/blob/master/docs/API.md#componentfromstream)
from [`recompose`](https://npmjs.com/package/recompose),
with the following enhancements:
* compatible with any [`React`](https://reactjs.org)-compatible library,<br/>
so long as it provides a [`React`](https://reactjs.org)-like `Component` class,
e.g. [`PREACT`](https://preactjs.com/) or [`Inferno`](https://infernojs.org/).
* support for operators that may dispatch back into source stream,<br/>
e.g. [`component-from-stream-redux`](https://npmjs.com/package/component-from-stream-redux).<br/>
more info in the [API section](#API).
* support for a custom `props` dispatcher instead of the default dispatcher,<br/>
e.g. to emit [FSAs](https://www.npmjs.com/package/flux-standard-action)
into the [`component-from-stream-redux`](https://npmjs.com/package/component-from-stream-redux) operator.
* shorthand support for separation of view from reactive behaviour (see below).
* life-cycle management and gated rendering from within
the component's reactive behaviour:
  * automatically complete on `componentWillUnmount`.
  * only render when the reactive operator emits a `props` object,<br/>
and render null on falsy values.

compatible with observable libraries such as [`RxJS`](http://reactivex.io/rxjs/)
or [`MOST`](https://www.npmjs.com/package/most)

# <a name="example"></a> Example: separation of view from reactive behaviour
see the full [example](./example/index.tsx) in this directory.<br/>
run the example in your browser locally with `npm run example`
or [online here](https://cdn.rawgit.com/ZenyWay/component-from-stream/v0.17.2/example/index.html).

the [`component-from-stream` example](https://github.com/acdlite/recompose/blob/master/docs/API.md#componentfromstream)
from `recompose` can be refactored as follows
to separate view rendering from reactive behaviour:
```jsx
const Counter = componentFromStream(pipe(newCounterOperator(), map(render)))

function render({ count, onClickIncrement, onClickDecrement, ...attrs }) {
  return (
    <pre {...attrs}>
      Count: {count}
      <button onClick={onClickIncrement}><b>+</b></button>
      <button onClick={onClickDecrement}><b>-</b></button>
    </pre>
  )
}

function newCounterOperator () {
  const diff$ = new Subject()
  const onClickIncrement = () => diff$.next(1)
  const onClickDecrement = () => diff$.next(-1)

  const count$ = diff$.pipe(
    startWith(0),
    scan((count, n) => count + n, 0)
  )

  return pipe(
    combineLatest(count$),
    map(([ props, count ]) => ({
      count,
      onClickIncrement,
      onClickDecrement,
      ...props
    }))
  )
}

function pipe (...operators) {
  return function (q$) {
    return q$.pipe(...operators)
  }
}
```
this module supports the following shorthand for this approach:
```ts
const Counter = componentFromStream(render, newCounterOperator)
```

separation of reactive behaviour from view rendering yields a number of advantages:
* behaviours are independent of rendering framework:
view rendering functions may easily be replaced.
* state can typically be confined to within a small subset
of composable reactive behaviours.
* unit behaviours can be shared between components.
* a component's behaviour can be extended by composing it
with additional unit behaviours.
* simpler unit testing:
  * stateless view rendering functions can easily be tested separately
  (e.g. with [storybook](https://storybook.js.org/))
  * behaviours operate exclusively within streams of `props` = no DOM involved.
  * unit testing effort can focus on stateful unit behaviours,
  stateless behaviours being straightforward to validate.
* a component's behaviour typically becomes self-documenting.

# <a name="API"></a>API: three `component-from-stream` factory signatures
<!-- ![component-from-stream diagram](./component-from-stream.svg) -->

the `component-from-stream` factory is not directly exposed by this module.<br/>
instead, a higher-level factory is exposed for injecting the following dependencies:
* the base `Component` from a [`React`](https://reactjs.org)-like library,
e.g. [`PREACT`](https://preactjs.com/) or [`Inferno`](https://infernojs.org/).
* Observable conversion functions for reactive operator support
from third-party Observable libraries, e.g. [`RxJS`](http://reactivex.io/rxjs/)
or [`MOST`](https://www.npmjs.com/package/most).

this higher-level factory returns the required component factory
after injection of the supplied dependencies.
it is typically only required once in a project,
the resulting `component-from-stream` factory being exposed to the project's
other modules:
```js
import createComponentFromStreamFactory from 'component-from-stream'
import { Component } from 'inferno'
import { from } from 'rxjs'

// component-from-stream factory based on Inferno and RxJS
export default createComponentFromStreamFactory(Component, from)
```

in addition to the [original `component-from-stream` factory signature](https://github.com/acdlite/recompose/blob/master/docs/API.md#componentfromstream)
from [`recompose`](https://npmjs.com/package/recompose),
the [example from the previous section](#example) illustrates
the additional dual-argument signature,
shorthand for separating view and reactive operator behaviour.

in this example, the reactive operator factory ignores its arguments.
however, that factory is nonetheless called with a number of arguments,
as detailed in the `OperatorFactory` type declaration below.
the first of these arguments is a `StreamableDispatcher` object,
which provides hooks into the internal dispatching mechanism.
this allows for more complex feedback control of the reactive operator chain.

this is most useful with the `component-from-stream` factory's third signature,
which takes at least three arguments
as specified in the `ComponentFromStreamFactory` interface declaration below.
in this configuration,
* the second argument is a projection function,
which maps the incoming props to any object before being dispatched into
the component's reactive operator.
* all remaining arguments are `OperatorFactory` factories.
the operators instantiated by these factories are composed from left to right
to generate the component's reactive operator,
that maps the dispatched objects to view props.

see the [`component-from-stream-redux`](https://npmjs.com/package/component-from-stream-redux)
module for an example implementation of this extended signature.

```ts
import { Subscribable } from 'rx-subject'
export { Subscribable }

export default function createComponentFromStreamFactory<C extends Component<N, any, any>, N>(
  ComponentCtor: new (props: any, context?: any) => C & Component<N, any, any>,
  fromESObservable: <T, O extends Subscribable<T>>(stream: Subscribable<T>) => O,
  opts?: Partial<ComponentFromStreamOptions>
): ComponentFromStreamFactory<C, N>
export default function createComponentFromStreamFactory<C extends Component<N, any, any>, N>(
  ComponentCtor: new (props: any, context?: any) => C & Component<N, any, any>,
  fromESObservable: <T, O extends Subscribable<T>>(stream: Subscribable<T>) => O,
  toESObservable: <T, O extends Subscribable<T>>(stream: O) => Subscribable<T>,
  opts?: Partial<ComponentFromStreamOptions>
): ComponentFromStreamFactory<C, N>

export interface ComponentFromStreamFactory<C extends Component<N, any, any>, N> {
  <P = {}>(operator: Operator<P, N>): ComponentFromStreamConstructor<C, N>
  <P = {}, Q = P>(
    render: (props: Q) => N,
    factory: OperatorFactory<P, P, Q>
  ): ComponentFromStreamConstructor<C, N>
  <P = {}, Q = P, A = P>(
    render: (props: Q) => N,
    project: Mapper<P, A>,
    operator: OperatorFactory<A, A, any>,
    ...operators: OperatorFactory<A, any, any>[]
  ): ComponentFromStreamConstructor<C, N>
}

export interface ComponentFromStreamOptions {}

export interface ComponentFromStreamConstructor<C extends Component<N, any, any>, N> {
  new <P = {}, Q = P>(props?: P, context?: any): C & ComponentFromStream<N, P, Q>
}

export interface ComponentFromStream<N, P = {}, Q = P>
  extends Component<N, P, PropsState<Q>> {
  componentWillMount(): void
  componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void
  componentWillUnmount(): void
  shouldComponentUpdate(props: Readonly<P>, state: Readonly<PropsState<Q>>): boolean
}

export interface ComponentConstructor<N> {
  new <P = {}, S = {}>(props: P, context?: any): Component<N, P, S>
}

export interface Component<N, P = {}, S = {}> {
  setState(state: Reducer<S, P> | Partial<S>, cb?: () => void): void
  render(props?: P, state?: S, context?: any): N | void
  props: Readonly<P>
  state: Readonly<S | null>
  context: any
}

export interface PropsState<Q> {
  props: Q
}

export declare type Mapper<P, A = P> = (props: P) => A

export declare type OperatorFactory<
  A = void,
  I = {},
  O = I,
  Q extends Subscribable<I> = Subscribable<I>,
  S extends Subscribable<O> = Subscribable<O>
> = (
  dispatch?: StreamableDispatcher<A>,
  fromESObservable?: <T, O extends Subscribable<T>>(stream: Subscribable<T>) => O,
  toESObservable?: <T, O extends Subscribable<T>>(stream: O) => Subscribable<T>
) => Operator<I, O, Q, S>

export declare type Operator<
  I = {},
  O = I,
  Q extends Subscribable<I> = Subscribable<I>,
  S extends Subscribable<O> = Subscribable<O>
> = (q$: Q) => S

export interface StreamableDispatcher<A, S extends Subscribable<A> = Subscribable<A>> {
  next(val: A): void
  from<E extends Subscribable<A>>(source$: E): void
  source$: S
}

export declare type Reducer<A, V> = (acc: A, val: V) => A;

export declare function identity<T>(v: T): T
```

# `Symbol.observable`
This module expects `Symbol.observable` to be defined in the global scope.
Use a polyfill such as [`symbol-observable`](https://npmjs.com/package/symbol-observable/)
and if necessary a `Symbol` polyfill.
Check the [`symbol-observable-polyfill` script](./package.json#L10)
for an example of how to generate the standalone polyfill,
which can than be [loaded from a script tag](./example/index.html#L27),
or simply add `import 'symbol-observable'` at the top of your project's main file.

# TypeScript
although this library is written in [TypeScript](https://www.typescriptlang.org),
it may also be imported into plain JavaScript code:
modern code editors will still benefit from the available type definition,
e.g. for helpful code completion.

# License
Copyright 2018 Stéphane M. Catala

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the [License](./LICENSE) for the specific language governing permissions and
Limitations under the License.

