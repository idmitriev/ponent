import render from '../index.js';
import todo from './todo.js';
import counter from './counter.js';
import counterCounter from './counterCounter'
import button from './button.js';
import { stream } from 'flyd';
 render(
     counterCounter({  count: 0}),
 	document.querySelector('#counter')
 )
 
 render(
 	todo({}),
 	document.querySelector('#todo')
 )

window.buttonProps = stream({ text: 'txt' });

render(
	button(window.buttonProps),
	document.querySelector('#button')
)