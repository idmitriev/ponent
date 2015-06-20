# ponent
Yet another functional UI library

## Demos

```bash
npm run demos
```

### Counter button

```js

const
	{ component } = require('ponent'),
	{ eq } = require('ramda'),
	{ scan } = require('flyd'),
	filter = require('flyd-filter'),
	{ button } = require('ponent').html;

const counterButton = component({
	state: (props, events) => ({
		text: scan(
			clicks => clicks + 1,
			0,
			filter(eq('click'), events)
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
