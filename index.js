const
	flyd = require('flyd'),
	{ stream: Stream, map: mapStream, isStream, on } = flyd,
	StreamObj = require('flyd-obj').stream,
	{ is, isNil, curry, curryN, map, nAry, mapObjIndexed, reduce, merge, omit, identity } = require('ramda'),
	deku = require('deku'),
	{ tree, render: dekuRender, element: dekuElement } = deku;

const
	Events = Stream,
	Props = Stream,
	State = curry(
		(stateSpec, events, props) => {
			const
				state = stateSpec(props, events);

			return isStream(state)
				? state
				: StreamObj(state)
		}
	),
	Element = mapStream;

const element = curryN(
	2,
	(type, props, children) => ({
		type: type || 'div',
		props: isNil(children) && !isStream(props)
			? props || {}
			: merge(
				!isNil(props) && isStream(props)
					? { _stream: props }
					: props || {},
				!isNil(children)
					? { children }
					: {}
			)
	})
);

const dekuComponent = spec => ({
	name: spec.name || 'component',
	defaultProps: spec.defaultProps,
	beforeMount(component) {
		const { props: initialProps, state, id } = component;

		state.events = Events(),
		state.props = Props(initialProps),
		state.state = State(spec.state, state.events, state.props),
		state.element = Element(spec.element, state.state);

		// if (initialProps.context && initialProps.context.events){
		// 	on((spec.events || identity)(initialProps.context.events), state.events);
		// }

		// if (initialProps._stream != null && isStream(initialProps._stream)){
		// 	on(state.props, initialProps._stream);
		// } 
	},
	shouldUpdate() {
		return true;
	},
	beforeRender (component) {
		const {props, state, id} = component
	},
	beforeUpdate (component, nextProps, nextState) {
		const {props, state, id} = component
		if (nextProps._stream != null && isStream(nextProps._stream)){ //TODO check if already plugged
			on(state.props, nextProps._stream);
		} else {
			state.props(nextProps)
		}
	},
	render(component, setState) {
		const {props, state, id} = component
		if ( !state.stateMapped && state.state ){
			mapStream(
				newState => setState(state),
				state.state
			);
			state.stateMapped = true;
		}
		return render(state, state.element());
	},
	afterRender (component, el) {
		const {props, state, id} = component
	},
	afterUpdate (component, prevProps, prevState, setState) {
		const {props, state, id} = component
	},
	afterMount (component, el, setState) {
		const {props, state, id} = component
	},
	beforeUnmount (component, el) {
		const { state } = component;
		state.element.end(true)
		state.state.end(true)
		state.props.end(true)
		state.events.end(true)
	}
})

const startsWith = (needle, haystack) =>
	haystack.indexOf(needle) === 0

const injectEventHandlers = curry(
	(events, props)  =>
		mapObjIndexed(
			(value, key) =>
				startsWith('on', key)
					? event => {
						events(
							is(Function, value)
								? value(event)
								: value
						)
						return false;
					}
					: value,
			props
		)
);

const render = curry(
	(context, element) => {
		const
			{ type, props } = element || {},
			{ children, id } = props || {},
			{ events } = context || {};

		return is(String, element) || isNil(element)
			? element
			: is(Number, element)
				? element.toString()
				: is(Array, element)
					? map(render(context), element)
					: is(Function, type)
						? render(context, type(props))
						: dekuElement(
							type,
							omit(
								is(String, type)
									? ['children']
									: [],
								events != null && props != null
									? injectEventHandlers(events, props)
									: props
							),
							render(context, children)
						);
	}
);

export default (element, domNode) =>
	dekuRender(tree(render({}, element)), domNode);

export const component = spec =>
	element(dekuComponent(spec));

export const stream = merge(flyd, { streamObject: StreamObj });

export const html = reduce(
	(acc, tag) => {
		acc[tag] = element(tag);
		return acc;
	},
	{},
	['a','abbr','address','area','article','aside','audio','b','base','bdi','bdo','blockquote','body','br','button','canvas','caption','cite','code','col','colgroup','data','datalist','dd','del','details','dfn','dialog','div','dl','dt','em','embed','fieldset','figcaption','figure','footer','form','h1','h2','h3','h4','h5','h6','head','header','hgroup','hr','html','i','iframe','img','input','ins','kbd','keygen','label','legend','li','link','main','map','mark','menu','menuitem','meta','meter','nav','noscript','object','ol','optgroup','option','output','p','param','pre','progress','q','rb','rp','rt','rtc','ruby','s','samp','script','section','select','small','source','span','strong','style','sub','summary','sup','table','tbody','td','template','textarea','tfoot','th','thead','time','title','tr','track','u','ul','var','video','wbr']
);
