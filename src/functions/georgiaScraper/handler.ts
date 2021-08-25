import 'source-map-support/register'

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway'
import { formatJSONResponse } from '@libs/apiGateway'
import { middyfy } from '@libs/lambda'
import chromium from 'chrome-aws-lambda'
import log from 'npmlog'
export interface Result {
  date: string
  drawTime: string
  numbers: string
}

const georgiaScraper: ValidatedEventAPIGatewayProxyEvent<any> = async (
  event
) => {
  let browser
  const { drawDate, drawName, drawTime } = event.pathParameters
  const date = drawDate.split('-')
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
      executablePath: await chromium.executablePath,
    })
    const page = await browser.newPage()
    await page.goto(`https://www.galottery.com/en-us/winning-numbers.html`)
    log.info('scraper', `navigating to ${page.url()}`)
    await page.select('#searchByDateYear', date[0])
    await page.select('#searchByDateMonth', date[1])
    await page.select('#searchByDateDay', date[2])
    log.info('scraper', 'selected date in search panel')
    await page.select('#gameSelect', drawName.toUpperCase())
    log.info('scraper', 'selected game type in search panel')
    await page.click('button[class="btn btn-primary btn-block"]')
    log.info('scraper', 'searching for winning numbers')
    await page.waitForSelector(`#${drawName}`, {
      timeout: 1000,
    })
    log.info('scraper', 'scraping the table')
    const result: Result[] = await page.$$eval(
      'table > tbody > tr',
      (tds: any, drawTime: string) => {
        return tds
          .map((td: any) => {
            const tmpData = td.innerText.split('\n')
            const dateAndDraw = tmpData[0].split('\t')
            if (dateAndDraw[1] !== drawTime.toUpperCase()) return null

            const result = {
              date: dateAndDraw[0],
              drawTime: dateAndDraw[1],
              numbers: tmpData[1]?.replace(/\D/g, ''),
            }

            return result
          })
          .filter(Boolean)
      },
      drawTime
    )
    log.info('scraper', 'closing the browser')
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

export const main = middyfy(georgiaScraper)
