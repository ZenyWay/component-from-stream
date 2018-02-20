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
* components expose a new `lift` class method for deriving new components
with additional behaviour by composing the original component's reactive operator
with additional reactive operators.
* for convenience, this module also exposes its `compose` function
for composing reactive operators.
* the `props$` Observable from which a component streams its `props`
automatically completes on `componentWillUnmount`,
pushing life-cycle management into the component's reactive operator (behaviour).
* components only render when its reactive operator emits a `props` object
to the rendering function: rendering can hence be gated
within a component's reactive operator (behaviour).
* a component renders null when it's reactive operator emits a falsy value
instead of a `props` object to the rendering function.

Observable libraries such as [`RxJS`](http://reactivex.io/rxjs/)
provide a very rich set of reactive operators
with which complex component behaviours can be implemented
in a purely reactive way.
this implementation focuses on the glue with which to connect reactive behaviour
with stateless rendering functions.

# Example
see the full [example](./example/index.tsx) in this directory.
run the example in your browser with `npm run example`.

this example is somewhat contrived, but should demonstrate
how to implement a `component-from-stream`
described in terms of its view and composed behaviour:

`copy-button.ts`
```ts
import renderButton from './view'
import withCopyButtonBehaviour from './behaviour'
import { createComponentFromStreamFactory } from 'component-from-stream'
import { from } from 'rxjs/observable/from'
import { distinctUntilChanged } from 'rxjs/operators'

const componentFromStream = createComponentFromStreamFactory(Component, from)

export default componentFromStream(
  renderButton,
  distinctUntilChanged(shallowEqual) // only render when necessary
).lift(withCopyButtonBehaviour)

// ...
```

`behaviour.ts`
```ts
import { compose } from 'component-from-stream'
import withEventHandlerProps from 'rx-with-event-handler-props'
import { map, tap } from 'rxjs/operators'

export default compose(
  tap(log('view-props:')),
  map(pick('disabled', 'onClick', 'icon')),
  map(withToggleIconWhenDisabled),
  withToggleDisabledOnSuccess,
  map(withCopyOnClick),
  withEventHandlerProps('click'),
  map(withDefaultProps)
)

// ...
```
each argument supplied to the above `compose` function is a reactive operator
which implements a specific unit behaviour by generating an output stream
of `props` from an input stream of `props`.
e.g. `withEventHandlerProps('click')` from [`rx-with-event-handler-props`](https://npmjs.com/package/rx-with-event-handler-props)
adds two `props` (`onClick` and `event`)
and emits the extended `props` object whenever it receives a new input,
or whenever the `onClick` handler is called (from the rendered `Component`).

the resulting event can then be further processed by a downstream operator,
e.g. `map(withCopyOnClick)`:
```ts
import copyToClipboard = require('clipboard-copy')
...
function withCopyOnClick (props: any) {
  return !props || !props.event || props.event.id !== 'click'
    ? props
    : { ...props, success: copyOnClick(props.event.payload, props.value) }
}

function copyOnClick(event, value) {
  event.preventDefault()
  return copyToClipboard(value) //true on success
}
```

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
```ts
declare function createComponentFromStreamFactory <N={},C={}>(
  ComponentCtor: new (props: any, context?: any) => C & Component<N,{},{}>,
  fromESObservable: <T>(stream: Observable<T>) => Observable<T>,
  toESObservable: <T>(stream: Observable<T>) => Observable<T> = identity
): ComponentFromStreamFactory<N,C>

type ComponentFromStreamFactory<N={},C={}> = <P={},Q={}>(
  render: (props: Q) => N,
  mapProps?: Operator<P, Q>
) => ComponentFromStreamConstructor<N, C, P, Q>

interface ComponentFromStreamConstructor<N={},C={},P={},Q={}> {
  new (props: P, context?: any): C & ComponentFromStream<N,P,Q>
  lift <R>(
    fromOwnProps: (props: Observable<R>) => Observable<P>
  ): ComponentFromStreamConstructor<N,C,R,Q>
}

interface ComponentFromStream<N={},P={},Q={}> extends Component<N,P,{props?:Q}> {
  props$: Observable<Readonly<P>>
  componentWillMount (): void
  componentWillReceiveProps (nextProps: Readonly<P>, nextContext: any): void
  componentWillUnmount (): void
}

interface ComponentConstructor<N={},P={}> {
  new (props: P, context?: any): Component<N,{},{}>
}

interface Component<N={},P={},S={}> {
  setState<K extends keyof S> (state: Pick<S, K> | S, cb?: () => void): void
  render(): N
  props: Readonly<P>
  state: Readonly<S>
}
```

this module also exposes its `compose` function for composing reactive operators:
```ts
declare function compose<I,O>(...ops: Operator<any,any>[]): Operator<I,O>

type Operator<I,O> = (props$: Observable<I>) => Observable<O>
```

# TypeScript
although this library is written in [TypeScript](https://www.typescriptlang.org),
it may also be imported into plain JavaScript code:
modern code editors will still benefit from the available type definition,
e.g. for helpful code completion.
