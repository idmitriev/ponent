const 
	{ map: mapStream } = require('flyd'),
	{ map, prop } = require('ramda'),
	{ component } = require('../index'),
	{li, input, ul} = require('../index').html;

const item = options => 
	li({},
		[
			input({ type: 'checkbox', checked: options.done ? 'checked' : null}),
			options.text
		]
	)

const list = items =>
	ul({}, 
		map(item, items || [])
	)

export default component({
	state: mapStream(prop('items')),
	element: list
})
