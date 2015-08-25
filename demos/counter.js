const
    render = require('../index'),
    { component } = render,
    { equals, prop } = require('ramda'),
    { scan, map } = require('flyd'),
    filter = require('flyd-filter'),
    { div, button } = require('../index').html;

export default component({
    state: (props, events) => ({
        id: map(prop('id'), props),
        count: scan(
            (clicks, e) => clicks + (e === '+' ? 1 : -1),
            0,
            filter(e => ['-', '+'].indexOf(e) !== -1, events)
        )
    }),
    element: state =>
        div({},[
            button(
                { onClick: '-' },
                '-'
            ),
            state.count,
            button(
                { onClick: '+' },
                '+'
            )
        ]),
    events: (_, state) => state
});
