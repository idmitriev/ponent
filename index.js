const
    deku = require('deku'),
    { tree, render: dekuRender } = deku,
    dekuElement = require('virtual-element'),
	{ stream: Stream, map: mapStream, isStream, on } = require('flyd'),
	StreamObj = require('flyd-obj').stream,
    forwardTo = require('flyd-forwardto'),
	{ is, isNil, curry, curryN, map, nAry, mapObjIndexed, reduce, merge, omit, identity } = require('ramda');

const
	Events = Stream,
    Props = Stream,
    Element = mapStream,
    OutEvents = curry((outEventsSpec, events, state) => {
        const
            outEvents = outEventsSpec(events, state);

        if (!isStream(outEvents)) {
            throw new Error("events spec does not return a stream");
        }

        return outEvents;
    }),

	State = curry((stateSpec, events, props) => {
		const
			state = stateSpec(props, events);

		return isStream(state)
			? state
			: StreamObj(state)
	});

const element = curryN(2, (type, props, children) => ({
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
		const
            { props: initialProps, state: dekuState, id } = component,
			{ _context: context, _stream: props } = initialProps;

		dekuState.inEvents = Events();
		dekuState.props = props != null && isStream(props)
			? props
			: Props(initialProps);
		dekuState.state = State(spec.state, dekuState.inEvents, dekuState.props);
		dekuState.element = Element(spec.element, dekuState.state);

		dekuState.outEvents = OutEvents(spec.events || identity, dekuState.inEvents, dekuState.state);

		if (context != null) {
            dekuState.context = context;
			if (context.inEvents) {
				on(context.inEvents, dekuState.outEvents);
			}
		}
	},
    shouldUpdate (component, nextProps, nextState) {
        let { props, state, id } = component;
        return true;
    },
	beforeRender (component) {
		const {props, state, id} = component
	},
	beforeUpdate (component, nextProps, nextState) {
		const
            { state: dekuState, id } = component,
            { _context: nextContext, _stream: props } = nextProps;

		if (props != null && isStream(props)){
		//	on(dekuState.props, props);//TODO check if already plugged
		} else {
            dekuState.props(nextProps)
		}
	},
	render(component, setState) {
		const {props, state: dekuState, id} = component;
		if ( !dekuState.stateMapped && dekuState.state ){
            dekuState.stateMapped = true;
			mapStream(_ => setState(dekuState), dekuState.state);
		}
		return render(dekuState, dekuState.element());
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
		const { state: dekuState } = component;
        dekuState.element.end(true);
        dekuState.state.end(true);
        dekuState.props.end(true);
        dekuState.inEvents.end(true);
        dekuState.outEvents.end(true)
	}
})

const startsWith = (needle, haystack) =>
	haystack.indexOf(needle) === 0;

const injectEventHandlers = curry((events, props) =>
		mapObjIndexed(
			(value, key) =>
				startsWith('on', key)
					? event => {
						events(
							is(Function, value)
								? value(event)
								: value
						);
						return false;
					}
					: value,
			props
		)
);

const render = curry((context, element) => {
		const
			{ type, props } = element || {},
			{ children, id } = props || {},
			{ inEvents } = context || {};

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
								inEvents != null && props != null
									? injectEventHandlers(inEvents, merge(props, { _context: context }))
									: merge(props, { _context: context })
							),
							render(context, children)
						);
	}
);

export default (element, domNode) =>
	dekuRender(tree(render({}, element)), domNode);

export const component = spec =>
	element(dekuComponent(spec));

export const html = reduce(
	(acc, tag) => {
		acc[tag] = element(tag);
		return acc;
	},
	{},
	['a','abbr','address','area','article','aside','audio','b','base','bdi','bdo','blockquote','body','br','button','canvas','caption','cite','code','col','colgroup','data','datalist','dd','del','details','dfn','dialog','div','dl','dt','em','embed','fieldset','figcaption','figure','footer','form','h1','h2','h3','h4','h5','h6','head','header','hgroup','hr','html','i','iframe','img','input','ins','kbd','keygen','label','legend','li','link','main','map','mark','menu','menuitem','meta','meter','nav','noscript','object','ol','optgroup','option','output','p','param','pre','progress','q','rb','rp','rt','rtc','ruby','s','samp','script','section','select','small','source','span','strong','style','sub','summary','sup','table','tbody','td','template','textarea','tfoot','th','thead','time','title','tr','track','u','ul','var','video','wbr']
);
