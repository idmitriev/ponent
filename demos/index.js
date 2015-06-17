import render from '../index.js';
import todo from './todo.js';
import counter from './counter.js';

render(
	counter({}),
	document.querySelector('#counter')
);

render(
	todo({}),
	document.querySelector('#todo')
)