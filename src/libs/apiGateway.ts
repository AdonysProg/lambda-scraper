import { Result } from '@functions/georgiaScraper/handler'
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda'
import type { FromSchema } from 'json-schema-to-ts'

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & {
  body: FromSchema<S>
}
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<
  ValidatedAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>

export const formatJSONResponse = (response: Result[]) => {
  const { numbers } = response.reduce(
    (prev, value) => Object.assign(prev, value),
    { numbers: '' }
  )
  return {
    statusCode: 200,
    body: JSON.stringify(numbers),
  }
}
