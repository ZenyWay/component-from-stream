# component-from-stream
[![NPM](https://nodei.co/npm/component-from-stream.png?compact=true)](https://nodei.co/npm/component-from-stream/)

based on [component-from-stream](https://github.com/acdlite/recompose/blob/master/docs/API.md#componentfromstream)
from [recompose](https://npmjs.com/package/recompose),
with the following enhancements:
* in addition to being independent from any Observable framework,
this implementation is also independent from any rendering framework,
so long as it provides a `React`-like `Component` class.
these dependencies are injected by the exported factory
into the component factory it returns.
* components are expressed as the combination of a view and a set of behaviours:
the stateless rendering function (the component's view) is separated
from the potentially stateful reactive operator (the component's behaviour)
which maps the component's input stream of `props` to that of its rendering function.
* the `props$` Observable from which a component streams its `props`
automatically completes on `componentWillUnmount`,
pushing life-cycle management into the component's reactive operator (behaviour).
* components only render when its reactive operator emits a `props` object
to the rendering function: rendering can hence be gated
within a component's reactive operator (behaviour).
* a component renders null when it's reactive operator emits a falsy value
instead of a `props` object to the rendering function.

another enhancement worth highlighting is the backward-compatible
instantiation of a `component-from_stream` using a custom input dispatcher,
that maps props before dispatching into the reactive operator, e.g. into actions.
see [`with-event-handlers`](https://npmjs.com/package/with-event-handlers/)
for a corresponding example.

separation of behaviour from view has many advantages, among which:
* state can typically be confined to within a small subset of behaviours.
* views can be stateless and easily tested separately (e.g. with [storybook](https://storybook.js.org/))
* straightforward unit testing:
  * behaviours operate exclusively within streams of `props` = no DOM involved.
  * unit testing development effort can focus on stateful unit behaviours,
  stateless behaviours being straightforward to test.
* a component's behaviour is mostly self-documenting.
* behaviours are independent of rendering framework.
* unit behaviours can be shared between components.
* for a given view, an existing component's behaviour can be extended
by composing it with additional unit behaviours.

this module is deliberately limited to providing
the glue with which to connect reactive behaviour
with stateless rendering functions.
Observable libraries such as [`RxJS`](http://reactivex.io/rxjs/)
or [`MOST`](https://www.npmjs.com/package/most)
provide a very rich set of reactive operators
with which complex component behaviours can be implemented,
in a purely reactive way.

# Example
see the full [example](./example/index.tsx) in this directory.
run the example in your browser locally with `npm run example`
or [online here](https://cdn.rawgit.com/ZenyWay/component-from-stream/v0.7.0/example/index.html).

this example demonstrates how to implement `component-from-stream` Components
described in terms of their view and composed behaviour:

`copy-button/index.ts`
```ts
import renderButton from './view'
import withCopyButtonBehaviour from './behaviour'
import { createComponentFromStreamFactory } from 'component-from-stream'
import { from } from 'rxjs/observable/from'
import { distinctUntilChanged } from 'rxjs/operators'

const componentFromStream = createComponentFromStreamFactory(Component, from)

// create a reactive component from view and behaviour
export default componentFromStream(renderButton, withCopyButtonBehaviour)
```

`copy-button/behaviour.ts`
```ts
import { shallowMerge, pick, log } from '../utils'
import compose from 'basic-compose'
import withEventHandler from 'rx-with-event-handler'
import { map, tap } from 'rxjs/operators'

export default compose(
  tap(log('copy-button:view-props:')),
  distinctUntilChanged(shallowEqual), // only render when necessary
  map(into('icon')(iconFromDisabled)),
  pickDistinct('disabled', 'onClick', 'icons'), // clean-up
  withToggleDisabledOnSuccess,
  withEventHandler('click')(map(into('success')(doCopyToClipboard))),
  map(shallowMerge(DEFAULT_PROPS)) // icons are not deep-copied
)

function doCopyToClipboard({ event, value }) {
  event.payload.preventDefault()
  return copyToClipboard(value) //true on success
}

function pickDistinct(...keys) {
  return compose(distinctUntilChanged(shallowEqual), map(pick(...keys)))
}

function iconFromDisabled ({ disabled, icons }: any) {
  return disabled ? icons.disabled : icons.enabled
}
// ...
```
each argument supplied to the above `compose` function is a reactive operator
which implements a specific unit behaviour by generating an output stream
of `props` from an input stream of `props`.

the unit behaviours are composed from bottom to top:
`props` are processed from outside to inside,
i.e. from component `props` to view `props`.

e.g. `withEventHandler('click')` from [`rx-with-event-handler`](https://npmjs.com/package/rx-with-event-handler/)
adds an `onClick` prop and emits the extended `props` object
whenever it receives a new input.
whenever the `onClick` handler is called (from the rendered `Component`),
it also adds an `event` prop to the emitted `props` object,
and pipes the latter through the given event handler operator,
in this case `map(into('success')(doCopyToClipboard))`,
which copies the `value` prop to the clipboard
and sets a `success` prop to `true` on success, `false` otherwise.

the resulting event can then be further processed by a downstream operator,
e.g. `withToggleDisabledOnSuccess`, which toggles the boolean `disabled` prop
for a brief moment whenever the `success` prop turns `true`.
[check the code](./example/copy-button/behaviour.ts#L64-L75)
for implementation details of this operator.

# API
the component factory is not directly exposed by this module:
instead, a higher-level factory is exposed for injecting the following dependencies:
* the base `Component` from a [`React`](https://reactjs.org)-like library,
e.g. [`PREACT`](https://preactjs.com/) or [`Inferno`](https://infernojs.org/).
* Observable conversion functions for reactive operator support
from third-party Observable libraries, e.g. [`RxJS`](http://reactivex.io/rxjs/)
or [`MOST`](https://www.npmjs.com/package/most).

this higher-level factory returns the required component factory
after injection of the supplied dependencies.

the above example illustrates the traditional instatiation of a `component-from-stream`,
with a reactive operator that maps incoming props to view props.
this module introduces a new backward-compatible instantiation of a `component-from_stream` using a custom input dispatcher,
that maps props before dispatching into the reactive operator, e.g. into actions.
this may be used for example for integrating action-based reactive reducers,
whereby the dispatcher maps props to actions.
see [`with-event-handlers`](https://npmjs.com/package/with-event-handlers/)
for a corresponding example.

```ts
export default function createComponentFromStreamFactory<N = {}, C = {}>(
  ComponentCtor: new (props: any, context?: any) => C & Component<N, {}, {}>,
  fromESObservable: <T>(stream: Observable<T>) => Observable<T>,
  toESObservable?: <T>(stream: Observable<T>) => Observable<T>
): ComponentFromStreamFactory<N, C>

export interface ComponentFromStreamFactory<N = {}, C = {}> {
  <P = {}, Q = P>(
    render: (props: Q) => N,
    behaviour?: RxOperator<P, Q>
  ): ComponentFromStreamConstructor<N, C, P, Q>
  <P = {}, A = P, Q = P>(
    render: (props: Q) => N,
    behaviour: Partial<BehaviourSpec<P, A, Q>>
  ): ComponentFromStreamConstructor<N, C, P, Q>
}

export interface ComponentFromStreamConstructor<N = {}, C = {}, P = {}, Q = P> {
  new (props: P, context?: any): C & ComponentFromStream<N, P, Q>
}

export interface ComponentFromStream<N = {}, P = {}, Q = P>
  extends Component<N, P, ViewPropsState<Q>> {
    _source$: Observable<Readonly<P>>
    componentWillMount(): void;
    componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void
    componentWillUnmount(): void
    shouldComponentUpdate(
      nextProps: Readonly<P>,
      nextState: Readonly<ViewPropsState<Q>>
    ): boolean
}

export interface ComponentConstructor<N = {}, P = {}> {
  new (props: P, context?: any): Component<N, {}, {}>
}

export interface Component<N = {}, P = {}, S = {}> {
  setState<K extends keyof S>(state: Pick<S, K> | S, cb?: () => void): void
  render(): N
  props: Readonly<P>
  state: Readonly<S>
}

export interface ViewPropsState<Q> {
  props: Q
}

export interface BehaviourSpec<P, A, Q> {
  dispatcher: PropsDispatcherFactory<P, A>
  operator?: RxOperator<A, Q>
}

export declare type PropsDispatcherFactory<P, A> =
  (dispatch: (v: A) => void) => (props: P) => void

export declare type RxOperator<I, O> = (props$: Observable<I>) => Observable<O>
```

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

