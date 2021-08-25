import { handlerPath } from '@libs/handlerResolver'

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'georgiaScraper/{drawDate}/{drawName}/{drawTime}',
      },
    },
    // {
    //   schedule: {
    //     rate: 'rate(1 minute)',
    //     enabled: true,
    //     name: 'Georgia Scraper',
    //     description: 'Hello there',
    //   },
    // },
  ],
}
