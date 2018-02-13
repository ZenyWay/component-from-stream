# component-from-stream
[![NPM](https://nodei.co/npm/component-from-stream.png?compact=true)](https://nodei.co/npm/component-from-stream/)

based on [component-from-stream](https://github.com/acdlite/recompose/blob/master/docs/API.md#componentfromstream)
from [recompose](https://npmjs.com/package/recompose),
with the following enhancements:
* the linear stateless rendering function (the component's view) is separated
from the `props$` reactive operator (the component's behaviour).
* components expose a new `lift` class method
for further composing its `props$` reactive operator
with other reactive operators, i.e. adding behaviour.
* the `props$` Observable completes on `componentWillUnmount`,
pushing life-cycle management into the component's behaviour
(its `props$` reactive operator).
* renders null when the component's `props$` reactive operator emits a falsy value.

Observable libraries such as [`RxJS`](http://reactivex.io/rxjs/)
provide very complete sets of reactive operators
with which complex component behaviours can be implemented
in a purely reactive approach.
this implementation focuses on the glue with which to connect reactive behaviour
with stateless rendering functions.

# Example
see the [example](./example) in this directory.
run the example in your browser with `npm run example`.

# API
the component factory is not directly exposed by this module:
instead, a higher-level factory is exposed for injecting the following dependencies:
* the base `Component` from a [React](https://reactjs.org)-compatible library,
e.g. [PREACT](https://preactjs.com/) or [Inferno](https://infernojs.org/).
* Observable conversion functions for reactive operator support
from third-party Observable libraries, e.g. [`RxJS`](http://reactivex.io/rxjs/)
or [MOST](https://www.npmjs.com/package/most).

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

this module also exposes its `combine` function for combining reactive operators:
```ts
declare function combine<I,O>(...ops: Operator<any,any>[]): Operator<I,O>

type Operator<I,O> = (props$: Observable<I>) => Observable<O>
```

# TypeScript
although this library is written in [TypeScript](https://www.typescriptlang.org),
it may also be imported into plain JavaScript code:
modern code editors will still benefit from the available type definition,
e.g. for helpful code completion.
