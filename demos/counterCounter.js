const
    { map, range } = require('ramda'),
    { component } = require('../index'),
    { div, ul, li } = require('../index').html,
    { pick, compose, is, prop, propEq } = require('ramda'),
    { map: mapStream, merge } = require('flyd'),
    filter = require('flyd-filter'),
    dropRepeats = require('flyd-droprepeats').dropRepeats;

import counter from './counter'

export default component({
    state: (props, events) =>
        mapStream(
            count => ({ count: count }),
            dropRepeats(
                merge(
                    dropRepeats(mapStream(prop('count'), props)),
                    mapStream(
                        prop('count'),
                        filter(propEq('id', 'mainCounter'), events)
                    )
                )
            )
        ),
    element: state =>
        div({},[
            counter({ id: 'mainCounter', count: state.count}),
            ul({},
                map(
                    item => li({}, counter({ id: ['counter', item].join('')})),
                    range(0, (state.count || 0))
                )
            )
        ])
})
