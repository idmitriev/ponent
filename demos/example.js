import render from '../index.js';
import button from './button.js';
import todo from './todo.js';

//render(button({}), document.body);
render(
	todo({
		items: [
			{ text: 'build frp ui lib' },
			{ text: 'profit' }
		]
	}),
	document.body
)