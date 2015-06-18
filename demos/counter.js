const
	{ component } = require('../index'),
	{ equals } = require('ramda'),
	{ scan } = require('flyd'),
	filter = require('flyd-filter'),
	{ button } = require('../index').html;

export default component({
	state: (props, events) => ({
		text: scan(
			(clicks, _) => clicks + 1,
			0,
			filter(equals('click'), events)
		)
	}),
	element: state => button({
		onClick: 'click',
		children: state.text
	})
})