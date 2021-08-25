import { handlerPath } from '@libs/handlerResolver'

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'newJerseyScraper/{drawDate}/{drawName}/{drawTime}',
      },
    },
    // {
    //   schedule: {
    //     rate: 'rate(1 minute)',
    //     enabled: true,
    //     name: 'New Jersey Scraper',
    //   },
    // },
  ],
}
