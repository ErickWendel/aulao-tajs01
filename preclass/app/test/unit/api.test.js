import { describe, before, it } from 'node:test'
import { deepStrictEqual, ok, strictEqual } from 'node:assert'
import { EventEmitter } from 'node:events'
import { handler } from '../../api.js'

const getFirstCallArg = (mock) => mock.calls[0].arguments[0]

const mockRequest = ({ url, method, headers, body }) => {
    const options = {
        url: url ?? '/',
        method: method ?? 'GET',
        headers: headers ?? {},
    }

    const request = new EventEmitter()

    request.url = options.url
    request.method = options.method
    request.headers = options.headers

    setTimeout(() => request.emit('data', JSON.stringify(body)));

    return request
}
const mockResponse = ({ mockContext }) => {
    const response = {
        writeHead: mockContext.fn(),
        end: mockContext.fn(),
        write: mockContext.fn(),
    }

    return response
}

describe('API Unit tests', () => {
    let _handler = {}
    before(async (context) => {
        _handler = handler
    })

    it('should receive not authorized given wrong user and password', async (context) => {
        const request = mockRequest({
            url: '/login',
            method: 'POST',
            body: {
                user: 'erickwendel',
                password: ''
            }
        })

        const response = mockResponse(
            { mockContext: context.mock }
        )

        await _handler(request, response)

        strictEqual(getFirstCallArg(response.writeHead.mock), 401, 'response.writeHead should be called with 401')

        strictEqual(response.end.mock.callCount(), 1, 'response.end should be called once')
        deepStrictEqual(getFirstCallArg(response.end.mock), '{"error":"user invalid!"}')
    })

    it('should login successfuly given user and password', async (context) => {
        const request = mockRequest({
            url: '/login',
            method: 'POST',
            body: {
                user: 'erickwendel',
                password: '123'
            }
        })

        const response = mockResponse(
            { mockContext: context.mock }
        )
        await _handler(request, response)
        const result = JSON.parse(getFirstCallArg(response.end.mock))
        // a boa prática é mockar até o modulo do JWT
        // mas vou deixar de desafio para você
        ok(result.token.length > 10, 'token should be present')
    })

})