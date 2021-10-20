import './App.css'

import React, { Component } from 'react'
import { Table, Card, Badge, Row, Column } from 'react-bootstrap'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const API = 'https://api.thegraph.com/subgraphs/name/graphprotocol/graph-network-mainnet'
const DEFAULT_QUERY = `{
  allocations (where: {indexer: "0x1873a56a404b21df3c69c0c105dd65b4e43d88e6"}) {
    id,
    status,
    createdAt,
    closedAt,
    indexingRewards,
    allocatedTokens,
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
      stakes: [45000, 5000, 25000, 25000],
      states: [],
      grtPrice: undefined,
      totalRewards: [4]
    }
  }

  componentDidMount () {
    window.fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-graph&vs_currencies=usd', {})
      .then(response => response.json())
      .then(data => {
        this.setState({ grtPrice: data['the-graph'].usd })
      })

    window.fetch(API, {
      method: 'POST',
      body: JSON.stringify({ query: DEFAULT_QUERY })
    })
      .then(response => response.json())
      .then(data => {
        // /////////////////////////////////////////////////////////////
        // first hits

        let hits = data.data.allocations

        // normalizez
        this.state.stakes = this.state.stakes.map(s => s * 10 ** 18)

        let { partners, stakes, states } = this.state

        const MILLIS_IN_DAY = 1000 * 60 * 60 * 24
        hits = hits.map(o => {
          o.createdAt = new Date(o.createdAt * 1000)
          o.closedAt = o.closedAt > 0 ? new Date(o.closedAt * 1000) : '-'
          o.durationDays = o.closedAt > 0 ? parseInt((o.closedAt - o.createdAt) / MILLIS_IN_DAY) : '-'
          o.rewardsUsd = parseInt(o.indexingRewards / 10 ** 18) * this.state.grtPrice
          o.apy = (365 / o.durationDays) * o.indexingRewards / o.allocatedTokens

          return o
        })

        // add in stake added actions
        hits.push({
          createdAt: new Date('2021-04-20'),
          closedAt: '-',
          stake: 15351.118,
          partner: 0,
          durationDays: '-',
          indexingRewards: 0,
          rewardsUsd: 0,
          subgraphDeployment: {
            versions: [
              {
                subgraph: {
                  displayName: '-'
                }
              }
            ]
          },
          status: 'Stake Added',
          id: partners[0]
        })

        hits.push({
          createdAt: new Date('2021-05-31'),
          closedAt: '-',
          stake: 5145.95967793,
          partner: 0,
          durationDays: '-',
          indexingRewards: 0,
          rewardsUsd: 0,
          subgraphDeployment: {
            versions: [
              {
                subgraph: {
                  displayName: '-'
                }
              }
            ]
          },
          status: 'Stake Added',
          id: partners[0]
        })

        hits.push({
          createdAt: new Date('2021-05-31'),
          closedAt: '-',
          stake: 1272,
          partner: 2,
          durationDays: '-',
          indexingRewards: 0,
          rewardsUsd: 0,
          subgraphDeployment: {
            versions: [
              {
                subgraph: {
                  displayName: '-'
                }
              }
            ]
          },
          status: 'Stake Added',
          id: partners[2]
        })

        hits.sort((a, b) => {
          return (a.createdAt < b.createdAt) ? -1 : (a.createdAt > b.createdAt) ? 1 : 0
        })

        // /////////////////////////////////////////////////////////////
        // now states

        let totalStake = stakes.reduce((a, b) => a + b)

        for (let index = 0; index < hits.length; index++) {
          let hit = hits[index]

          states.push([])

          for (let i = 0; i < partners.length; i++) {
            const grtPrice = this.state.grtPrice
            let start = index > 0 ? states[index - 1][i].end : stakes[i]
            let share = start / totalStake
            let payout = share * hit.indexingRewards
            let payoutUsd = parseInt(payout / 10 ** 18) * grtPrice
            let end = start + payout

            let totalRewards = this.state.totalRewards
            totalRewards[i] = (totalRewards[i] || 0) + payout
            let totalRewardsUsd = parseInt(totalRewards[i] / 10 ** 18) * grtPrice
            this.setState({ totalRewards })

            if (hit.status === 'Stake Added') {
              if (hit.partner === i) {
                end += hit.stake * 10 ** 18
                payout = 0
                payoutUsd = 0
              }
            }

            states[index].push({
              partner: partners[i],
              share,
              payout,
              payoutUsd,
              start,
              end,
              totalRewards: totalRewards[i],
              totalRewardsUsd
            })
          }

          totalStake += parseInt(hit.indexingRewards)
        }

        this.setState({ hits, states })
      })
  }

  render () {
    const { hits } = this.state

    return (
      <div className="App">
        {/* <p>
          <a class="btn btn-primary" data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
            Link with href
          </a>
        </p>
        <div class="collapse" id="collapseExample">
          <div class="card card-body">
            Some placeholder content for the collapse component. This panel is hidden by default but revealed when the user activates the relevant trigger.
          </div>
        </div> */}

        <header><h1>This is a prototype.</h1></header>
        {hits.map((hit, index) =>
          <Table>
            <thead>
              <tr>
                <th>Create Time</th>
                <th>Closed Time</th>
                <th>Status</th>
                <th>Subgraph</th>
                <th>Allocation</th>
                <th>Duration</th>
                <th>APY</th>
                <th>Indexer Rewards</th>
                <th>Rewards USD</th>
              </tr>
            </thead>
            <tbody>
              <tr key={hit.id}>
                <td>{hit.createdAt.toLocaleString()}</td>
                <td>{hit.closedAt.toLocaleString()}</td>
                <td>{hit.status}</td>
                <td>{hit.subgraphDeployment.versions[0].subgraph.displayName}</td>
                <td>{hit.id}</td>
                <td>{hit.durationDays} Days
                  &nbsp;{hit.durationDays > 28 &&
                    <Badge bg="warning">Warning</Badge>
                  }</td>
                <td>{(hit.apy * 100).toLocaleString()}%</td>
                <td>
                  <strong>
                    {(hit.indexingRewards / 10 ** 18).toLocaleString()}
                    &nbsp;{hit.closedAt > 0 && (hit.indexingRewards / 10 ** 18) < 1 &&
                      <Badge bg="danger">No Rewards</Badge>
                    }
                  </strong>
                </td>
                <td><strong>${hit.rewardsUsd.toLocaleString()}</strong></td>
              </tr>
              <tr>
                <td colSpan="9">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Partner</th>
                        <th>Start Stake</th>
                        <th>Rewards Cut</th>
                        <th>Rewards USD</th>
                        <th>End Stake</th>
                        <th>Total Rewards</th>
                        <th>Total Rewards USD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.partners.map((partner, pindex) =>
                        <tr key={pindex} className={this.state.states[index][pindex].end > this.state.states[index][pindex].start ? '' : 'd-  none'}>
                          <td>{partner}</td>
                          <td>{(this.state.states[index][pindex].start / 10 ** 18).toLocaleString()}</td>
                          <td>
                            {(this.state.states[index][pindex].payout / 10 ** 18).toLocaleString()}
                          </td>
                          <td>${(this.state.states[index][pindex].payoutUsd).toLocaleString()}</td>
                          <td>{(this.state.states[index][pindex].end / 10 ** 18).toLocaleString()}</td>
                          <td>{(this.state.states[index][pindex].totalRewards / 10 ** 18).toLocaleString()}</td>
                          <td>${(this.state.states[index][pindex].totalRewardsUsd).toLocaleString()}</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </td>
              </tr>
            </tbody>
          </Table>
        )}
      </div>
    )
  }
}

export default App
