import 'source-map-support/register'

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway'
import { format } from 'date-fns'
import { formatJSONResponse } from '@libs/apiGateway'
import { middyfy } from '@libs/lambda'
import chromium from 'chrome-aws-lambda'
import log from 'npmlog'

export interface Result {
  date: string
  drawTime: string
  numbers: string
}

const newJerseyScraper: ValidatedEventAPIGatewayProxyEvent<any> = async (
  event
) => {
  let browser
  const { drawDate, drawName, drawTime } = event.pathParameters
  try {
    const dateFormat = format(new Date(drawDate + ' '), 'MM/d/yyyy')
    const gameNumber = parseInt(drawName.slice(-1))
    browser = await chromium.puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
      ],
      headless: true,
      defaultViewport: {
        width: 1000,
        height: 1000,
      },
      ignoreHTTPSErrors: true,
      executablePath: await chromium.executablePath,
    })
    const page = await browser.newPage()

    await page.goto(
      `https://www.njlottery.com/en-us/drawgames/pick${gameNumber}.html#tab-winningNumbers`
    )
    await page.setViewport({
      width: 720,
      height: 920,
    })

    log.info('scraper', `navigating to ${page.url()}`)
    await page.click('span[class="icon-search"]')
    await page.waitForSelector('#searchPanel', {
      visible: true,
    })
    log.info('scraper', 'opened search panel')
    await page.$eval('#searchFrom', (e) => e.removeAttribute('readonly'))
    await page.type('[name="date-from"]', dateFormat)

    await page.$eval('#searchTo', (e) => e.removeAttribute('readonly'))
    const dateTo = await page.$('[name="date-to"]')
    await dateTo?.click({ clickCount: 3 })
    await dateTo?.type(dateFormat)
    log.info('scraper', 'typed the date to search')

    await page.click('#searchWinningNumbers')
    log.info('scraper', 'waiting for winning numbers')
    await page.waitForSelector('.table__winning-numbers', {
      visible: true,
    })
    log.info('scraper', 'scraping the table')
    const result: Result[] = await page.$$eval(
      'table > tbody > tr',
      (tds: any, drawTime: string) => {
        return tds
          .map((td: any) => {
            const tmpData = td.innerText.split('\n')
            if (tmpData[1] !== drawTime.toUpperCase()) return null
            const result = {
              date: tmpData[0],
              drawTime: tmpData[1],
              numbers: tmpData[2]?.replace(/\D/g, '').slice(0, -1),
            }

            return result
          })
          .filter(Boolean)
      },
      drawTime
    )
    log.info('scraper', 'closing the browser')
    await page.close()
    await browser.close()
    return formatJSONResponse(result)
  } catch (err) {
    log.error('scraper', err)
    return {
      statusCode: 502,
      body: JSON.stringify(err),
    }
  }
}

export const main = middyfy(newJerseyScraper)
