let records_container = [];

// Here we are doing a search, and specify a scroll timeout
var { _scroll_id, hits } = await esclient.search({
    index: 'mongodbschema_schedules',
    type: 'records',
    scroll: '10s',
    body: {
        query: {
            "match_all": {}
        },
        _source: false
    }
})

while (hits && hits.hits.length) {
    records_container.push(...hits.hits)
    console.log(`${records_container.length} of ${hits.total}`)

    var { _scroll_id, hits } = await esclient.scroll({
        scrollId: _scroll_id,
        scroll: '10s'
    })
}

console.log(`Process Done: ${records_container.length} Total Fetched Records `)