const 
	{ scan } = require('flyd'),
	{ map, prop, assoc, append, filter } = require('ramda'),
	{ component } = require('../index'),
	{li, input, ul, div, button} = require('../index').html;

const match = (value, dispatchers) =>
	(dispatchers[value] || dispatchers.default || (() => undefined))()	

const remove = (item, list) =>
	filter(i => i !== item, list)

const todo = item => 
	li({}, [
		input({
			type: 'checkbox',
			checked: item.done ? 'checked' : null
		}),
		item.text,
		button(
			{ onClick: { action: 'remove',  item }},
			'x'
		)
	])

const todos = state => 
	div({}, [
		input({
			type: 'text',
			onKeyDown: event => 
				event.keyCode == 13
				? ({
					action: 'add',
					item: { text: event.target.value }
				})
				: ({
					action: 'input',
					text: event.target.value + String.fromCharCode(event.keyCode)
				}),
			value: state.new
		}),
		ul({}, 
			map(todo, state.items || [])
		)
	])

const update = (state, event) =>
	match(event.action, {
		input: () => 
			assoc(
				'new',
				event.text,
				state
			),
		add: () => 
			assoc(
				'items',
				append(event.item, state.items),
				assoc(
					'new',
					'',
					state
				)
			),
		remove: () => 
			assoc(
				'items', 
				remove(event.item, state.items),
				state
			),
		default: () => state
	})

export default component({
	state: (props, events) =>
		scan(update, { items: []}, events),
	element: todos
})
