#!/usr/bin/env node
/**
 * @author UMU618 <umu618@hotmail.com>
 * @copyright MEET.ONE 2019
 * @description Use block-always-using-brace npm-coding-style.
 */

'use strict'

global.fetch = require('node-fetch')
global.WebSocket = require('ws')

const alerts = require('./utils/alerts')
const conf = require('./conf')

const { createDfuseClient } = require('@dfuse/client')

const client = createDfuseClient({
  apiKey: conf.apiKey,
  network: 'mainnet.eos.dfuse.io'
})

; (async () => {
  let message = ''
  await client.searchTransactions('receiver:voteforvalue action:deduct'
    , { startBlock: 0, sort: 'desc', blockCount: 2*3600*24 })
    .then((res) => {
        if (res.transactions) {
          for (const trx of res.transactions) {
            if (trx.lifecycle.transaction_status === 'executed') {
              for(const at of trx.lifecycle.execution_trace.action_traces) {
                if (at.act.account === 'voteforvalue' && at.act.name === 'deduct'
                  && at.act.data.username === 'eosiomeetone') {
                  message += trx.lifecycle.execution_trace.block_time + ', '
                    + at.act.data.memo + ', ' + at.act.account + ' deduct '
                    + at.act.data.amount + ' from ' + at.act.data.username
                    + '\n'
                }
              }
            }
          }
        }
      })

  await client.searchTransactions('receiver:genereospool action:notify'
    , { startBlock: 0, sort: 'desc', blockCount: 2*3600*24 })
    .then((res) => {
        if (res.transactions) {
          for (const trx of res.transactions) {
            if (trx.lifecycle.transaction_status === 'executed') {
              for(const at of trx.lifecycle.execution_trace.action_traces) {
                for(const it of at.inline_traces) {
                  
                  if (it.act.account === 'genereospool' && it.act.name === 'notify') {
                    for (const p of it.act.data.paid_producers) {
                      if (p.key === 'eosiomeetone') {
                        message += trx.lifecycle.execution_trace.block_time
                          + ', ' + it.act.data.message + ' for '
                          + it.act.data.proxy + ', ' + it.act.account
                          + ' deduct ' + p.value + ' from ' + p.key + '\n'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })

  client.release()

  message += '(Message sent from ' + require('os').hostname() + ')'
  alerts.sendFeishu(conf.infoToken, message)
})()
