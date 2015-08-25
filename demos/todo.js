const 
	{ stream, merge, scan } = require('flyd'),
	{ map, prop, assoc, append, filter, compose, curry, identity } = require('ramda'),
	{ component } = require('../index'),
	{ li, input, ul, div, button, span } = require('../index').html;

const match = (value, args, matchers) =>
	(matchers[value] || matchers.default || (() => undefined)).apply(null, args || [])	

const remove = curry((item, list) =>
	filter(i => i !== item, list))

const modifyItems = curry((action, state) =>
	assoc(
		'items',
		action(state.items),
		state
	))

const modifyItem = curry((action, itemToModify, state) =>
	modifyItems(		
		map(item => item === itemToModify 
			? action(item)
			: item
		),
		state
	))

const update = (state, event) =>
	match(event.action, [state], {
		input: assoc('new', event.text),
		clear: assoc('new', ''),
		add: compose(
			modifyItems(append(event.item)),
			assoc('new', '')
		),
		remove: modifyItems(remove(event.item)),
		edit: modifyItem(
			assoc('text', event.text), 
			event.item
		),
		startEditing: modifyItem(
			assoc('editing', true), 
			event.item
		),
		endEditing: modifyItem(
			assoc('editing', false), 
			event.item
		),
		toggle: modifyItem(
			assoc('done', event.item && !event.item.done),
			event.item
		),
		default: identity
	})

const todo = item => 
	li({}, [
		input({
			type: 'checkbox',
			checked: item.done ? 'checked' : null,
			onChange: { action: 'toggle', item }
		}),
		item.editing 
			? input({
				type: 'text',
				value: item.text, 
				onBlur: { action: 'endEditing', item },
				onInput: event => ({
					action: 'edit',
					item,
					text: event.target.value
				}),
				onKeyDown: event => 
					event.keyCode === 13 || event.keyCode === 27
						? { action: 'endEditing', item }
						: { action: 'nop' },
			})
			: span(
				{ onDoubleClick: { action: 'startEditing', item }},
				 item.text
			 ),
		button(
			{ onClick: { action: 'remove',  item } },
			'delete'
		)
	])

const todos = state =>
	div({}, [
		input({
			type: 'text',
			onKeyDown: event => 
				event.keyCode === 13
					? ({
						action: 'add',
						item: { text: event.target.value }
					})
					: event.keyCode === 27
						? { action: 'clear'}
						: { action: 'nop' },
			onInput: event => 
				({
					action: 'input',
					text: event.target.value
				}),
			value: state.new
		}),
		ul({}, 
			map(todo, state.items || [])
		)
	])

// amok
const source = stream({});
window.addEventListener('source', source);

export default component({
	element: todos,
	state: (props, events) =>
		scan(
			update, 
			{ items: [] },
			merge(events, source)
		),
})
