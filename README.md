# ponent
Yet another functional UI library

## Demos

```bash
npm run demos
```

### Counter button

```js

const
	render = require('ponent'),
	{ component } = render,
	{ equals } = require('ramda'),
	{ scan } = require('flyd'),
	filter = require('flyd-filter'),
	{ button } = require('ponent').html;

const counterButton = component({
	state: (props, events) => ({
		text: scan(
			clicks => clicks + 1,
			0,
			filter(equals('click'), events)
		)
	}),
	element: state => 
		button(
			{ onClick: 'click' },
			state.text
		)
});

render(couterButton({}), document.body);

```
