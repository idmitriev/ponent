import render from '../index.js';
import { stream } from '../index.js';
import todo from './todo.js';
import counter from './counter.js';
import button from './button.js';

render(
	counter({}),
	document.querySelector('#counter')
)

render(
	todo({}),
	document.querySelector('#todo')
)

window.buttonProps = stream.stream({ text: 'txt' })

render(
	button(window.buttonProps),
	document.querySelector('#button')
)