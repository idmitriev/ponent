const
	{ stream: Stream, map: mapStream, isStream } = require('flyd'),
	StreamObj = require('flyd-obj').stream,
	{ is, isNil, curry, curryN, map, nAry, mapObjIndexed, substringTo, reduce, merge} = require('ramda'),
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
		props: merge(
			props || {},
			isNil(children) 
				? {}
				: { children }
		)
	})
);

const dekuComponent = spec => {
	const
		events = Events(),
		props = Props(),
		state = State(spec.state, events, props),
		element = Element(spec.element, state);

	let stateMapped = false;

	return {
		props,
		state,
		events,
		name: spec.name || 'component',
		initialState: spec.initialState,
		defaultProps: spec.defaultProps,
		beforeMount(component) {
			const { props: initialProps, state, id} = component;
			props(initialProps);
		},
		shouldUpdate(){
			return true;
		},
		beforeRender (component) {
			const {props, state, id} = component
		},
		beforeUpdate (component, nextProps, nextState) {
			//const {props, state, id} = component
			props(nextProps)
		},
		render(component, setState){
			//const {props, state, id} = component
			if ( !stateMapped ){
				mapStream(setState, state);
				stateMapped = true;
			}
			return render(this, element());
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
			const {props, state, id} = component
			element.end(true)
			state.end(true)
			props.end(true)
			events.end(true)
		}
	}
};

const startsWith = (needle, haystack) =>
	substringTo(needle.length, haystack) === needle;

const injectEventHandlers = curry(
	(events, props)  =>
		mapObjIndexed(
			(value, key) =>
				startsWith('on', key)
					? event => events(
						is(Function, value)
							? value(event)
							: value
					)
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
							is(String, type)
								? type
								: dekuComponent(type),
							events != null && props != null
								? injectEventHandlers(events, props)
								: props,
							render(context, children)
						);
	}
);

export default (element, domNode) =>
	dekuRender(tree(render({}, element)), domNode);

export const component = element;

export const html = reduce(
	(acc, tag) => {
		acc[tag] = element(tag);
		return acc;
	},
	{},
	['a','abbr','address','area','article','aside','audio','b','base','bdi','bdo','blockquote','body','br','button','canvas','caption','cite','code','col','colgroup','data','datalist','dd','del','details','dfn','dialog','div','dl','dt','em','embed','fieldset','figcaption','figure','footer','form','h1','h2','h3','h4','h5','h6','head','header','hgroup','hr','html','i','iframe','img','input','ins','kbd','keygen','label','legend','li','link','main','map','mark','menu','menuitem','meta','meter','nav','noscript','object','ol','optgroup','option','output','p','param','pre','progress','q','rb','rp','rt','rtc','ruby','s','samp','script','section','select','small','source','span','strong','style','sub','summary','sup','table','tbody','td','template','textarea','tfoot','th','thead','time','title','tr','track','u','ul','var','video','wbr']
);