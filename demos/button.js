const
	{ component } = require('../index'),
	{ equals } = require('ramda'),
	{ scan } = require('flyd'),
	filter = require('flyd-filter'),
	{ button } = require('../index').html;

export default component({
	state: (props, events) => props,
	element: state => button({
		children: state.text
	})
})