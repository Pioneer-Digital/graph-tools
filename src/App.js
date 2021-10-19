import './App.css'

import React, { Component } from 'react'
import { Table, Card, Row, Column } from 'react-bootstrap'

import 'bootstrap/dist/css/bootstrap.min.css'

const API = 'https://api.thegraph.com/subgraphs/name/graphprotocol/graph-network-mainnet'
const DEFAULT_QUERY = `{
  allocations (where: {indexer: "0x1873a56a404b21df3c69c0c105dd65b4e43d88e6"}) {
    id,
    status,
    createdAt,
    closedAt,
    indexingRewards,
    indexer {
      id,
      defaultDisplayName
    },
    subgraphDeployment {
      id
      versions {
        id
        subgraph {
          id
          displayName
          image
        }
      }
    }
  }
}`

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hits: [],
      partners: ['Rui', 'Matt', 'Bridger', 'Billy'],
      stakes: [25000, 25000, 25000, 25000],
      payouts: [],
      states: []
    }
  }

  componentDidMount () {
    window.fetch(API, {
      method: 'POST',
      body: JSON.stringify({ query: DEFAULT_QUERY })
    })
      .then(response => response.json())
      .then(data => {
        console.log(JSON.stringify(data))

        let hits = data.data.allocations

        // normalizez
        this.state.stakes = this.state.stakes.map(s => s * 10 ** 18)

        const MILLIS_IN_DAY = 1000 * 60 * 60 * 24
        hits = hits.map(o => {
          o.createdAt = new Date(o.createdAt * 1000)
          o.closedAt = new Date(o.closedAt * 1000)
          o.durationDays = parseInt((o.closedAt - o.createdAt) / MILLIS_IN_DAY)
          return o
        })

        hits.sort((a, b) => {
          return (a.createdAt < b.createdAt) ? -1 : (a.createdAt > b.createdAt) ? 1 : 0
        })

        let { partners, stakes, states } = this.state

        let totalStake = stakes.reduce((a, b) => a + b)

        for (let index = 0; index < hits.length; index++) {
          let hit = hits[index]

          states.push([])
          for (let i = 0; i < partners.length; i++) {
            let start = index > 0 ? states[index - 1][i].end : stakes[i]
            let share = start / totalStake
            let payout = share * hit.indexingRewards
            let end = start + payout

            let apy = (365 / hit.durationDays) * payout / start

            states[index].push({
              partner: partners[i],
              share,
              payout,
              start,
              end,
              apy
            })
          }
          console.log('states', states)
          totalStake += parseInt(hit.indexingRewards)
        }

        this.setState({ hits, states })
      })
  }

  render () {
    const { hits } = this.state

    return (
      <div className="App">
        <header><h1>This is a prototype.</h1></header>
        {hits.map((hit, index) =>
          <Card>
            <Card.Title>
              <h2>{hit.createdAt.toLocaleString()}</h2>
              <h2>Allocation {hit.id} ({hit.status})</h2>
            </Card.Title>
            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Subgraph</th>
                    <th>Status</th>
                    <th>Allocation</th>
                    <th>Create Time</th>
                    <th>Closed Time</th>
                    <th>Duration</th>
                    <th>Indexer Rewards</th>
                  </tr>
                </thead>
                <tbody>
                  <tr key={hit.id}>
                    <td>{hit.subgraphDeployment.versions[0].subgraph.displayName}</td>
                    <td>{hit.status}</td>
                    <td>{hit.id}</td>
                    <td>{hit.createdAt.toLocaleString()}</td>
                    <td>{hit.closedAt.toLocaleString()}</td>
                    <td>{hit.durationDays} Days</td>
                    <td>{(hit.indexingRewards / 10 ** 18).toLocaleString()}</td>
                  </tr>
                </tbody>
              </Table>

              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Partner</th>
                    <th>Start Stake</th>
                    <th>Rewards Cut</th>
                    <th>End Stake</th>
                    <th>APY</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.partners.map((partner, pindex) =>
                    <tr>
                      <td>{partner}</td>
                      <td>{(this.state.states[index][pindex].start / 10 ** 18).toLocaleString()}</td>
                      <td>{(this.state.states[index][pindex].payout / 10 ** 18).toLocaleString()}</td>
                      <td>{(this.state.states[index][pindex].end / 10 ** 18).toLocaleString()}</td>
                      <td>{(this.state.states[index][pindex].apy * 100).toFixed(1)}%</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </div>
    )
  }
}

export default App
