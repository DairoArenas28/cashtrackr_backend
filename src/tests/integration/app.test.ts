import request from 'supertest'
import server, { connectDB } from '../../server'
import { AuthController } from '../../controllers/AuthController'
/*describe('Test', () => {

    beforeAll(async () => {
        await connectDB()
    })

    it('should return a 200 status code from the homepage url', async () => {
        const response = await request(server).get('/')

        expect(response.statusCode).toBe(200)
    } )
})*/

describe('Authentication - Create Account', () => {
    it('should display validation erros when from is empty', async () => {
        const response = await request(server)
                            .post('/api/auth/create-account')
                            .send({})

        const createAccountMock = jest.spyOn(AuthController, 'createAccount')

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(3)

        expect(response.status).not.toBe(200)
        expect(response.body.errors).not.toHaveLength(2)
        expect(createAccountMock).not.toHaveBeenCalled()

    })

    it('should return 400 status code when the email is invalid', async () => {
        const response = await request(server)
                            .post('/api/auth/create-account')
                            .send({
                                "name": "Juan",
                                "password": "12345678",
                                "email": "not_valid_email"
                            })

        const createAccountMock = jest.spyOn(AuthController, 'createAccount')

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)

        expect(response.body.errors[0].msg).toBe('E-mail no válido')

        expect(response.status).not.toBe(200)
        expect(response.body.errors).not.toHaveLength(2)
        expect(createAccountMock).not.toHaveBeenCalled()

    })

    it('should return 400 status code when the password is less the 8 characteres', async () => {
        const response = await request(server)
                            .post('/api/auth/create-account')
                            .send({
                                "name": "Juan",
                                "password": "12345",
                                "email": "test@test.com"
                            })

        const createAccountMock = jest.spyOn(AuthController, 'createAccount')

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)

        expect(response.body.errors[0].msg).toBe('El password es muy corto, mínimo 8 caracteres')

        expect(response.status).not.toBe(200)
        expect(response.body.errors).not.toHaveLength(2)
        expect(createAccountMock).not.toHaveBeenCalled()

    })

    it('should register a new user successful', async () => {

        const userData = {
            "name": "Juan",
            "password": "12345678",
            "email": "test@test.com"
        }

        const response = await request(server)
                            .post('/api/auth/create-account')
                            .send(userData)

        expect(response.status).toBe(201)

        expect(response.status).not.toBe(400)
        expect(response.body).not.toHaveProperty('errors')

    })

    it('should return 409 conflict when a user is already registered', async () => {

        const userData = {
            "name": "Juan",
            "password": "12345678",
            "email": "test@test.com"
        }

        const response = await request(server)
                            .post('/api/auth/create-account')
                            .send(userData)

        expect(response.status).toBe(409)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Un usuario con ese email ya esta resgistrado')
        expect(response.status).not.toBe(400)
        expect(response.status).not.toBe(201)
        expect(response.body).not.toHaveProperty('errors')

    })
})

describe('Authentication - Account Confirmation with Token ', () => {
    it('should display error if token is empty or token no valid', async () => {
        const response = await request(server)
                            .post('/api/auth/confirm-account')
                            .send({
                                "token": ""
                            })

        expect(response.statusCode).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('Token no válido')
    })

    it('should display error if token doesnt exists', async () => {
        const response = await request(server)
                            .post('/api/auth/confirm-account')
                            .send({
                                "token": "123456"
                            })

        expect(response.statusCode).toBe(401)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Token no válido')
        expect(response.status).not.toBe(200)
    })

    it('should confirm account with a valid token', async () => {
        const token = globalThis.cashTrackrConfirmationToken

        const response = await request(server)
                            .post('/api/auth/confirm-account')
                            .send({
                                "token": token
                            })

        expect(response.status).toBe(200)
        expect(response.body).toBe('Cuenta confirmada correctamente')
        expect(response.status).not.toBe(401)
    })
})


