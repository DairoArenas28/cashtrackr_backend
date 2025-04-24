import request from 'supertest'
import server, { connectDB } from '../../server'
import { AuthController } from '../../controllers/AuthController'
import User from '../../models/User'
import * as authUtils from '../../utils/auth'
import * as jwtUtils from '../../utils/jwt'
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
            "password": "password",
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

describe('Authentication - Login', () => {

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display validation errors when the form is empty', async () => {
        const response = await request(server)
                            .post('/api/auth/login')
                            .send({})
        
        const loginMock = jest.spyOn(AuthController, 'login')  

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(2)

        expect(response.body.errors).not.toHaveLength(1)
        expect(loginMock).not.toHaveBeenCalled()
    })

    it('should return 400 bad request when the email is invalid', async () => {
        const response = await request(server)
                            .post('/api/auth/login')
                            .send({
                                "email": "not_valid",
                                "password": "password"
                            })
        
        const loginMock = jest.spyOn(AuthController, 'login')  

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('Email no válido')

        expect(response.body.errors).not.toHaveLength(2)
        expect(loginMock).not.toHaveBeenCalled()
    })

    it('should return a 400  error if the user is no found', async () => {
        const response = await request(server)
                            .post('/api/auth/login')
                            .send({
                                "email": "not_found@tt.com",
                                "password": "password"
                            })
        

        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Usuario no encontrado')

        expect(response.status).not.toBe(200)
    })

    it('should return a 403 error if user account is not confirmed', async () => {

        (jest.spyOn(User, 'findOne') as jest.Mock)
            .mockResolvedValue({
                id: 1,
                confirmed: false,
                password: "hashedpassword",
                email: "test@test.com"
            })

        const response = await request(server)
                            .post('/api/auth/login')
                            .send({
                                "email": "test@test.com",
                                "password": "hashedpassword"
                            })
        

        expect(response.status).toBe(403)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('La cuenta no ha sido confirmada')

        expect(response.status).not.toBe(200)
        expect(response.status).not.toBe(404)
    })

    //TODO: No encuentra el usuario, no le veo el por que
    /*it('should return a 403 error if user account is not confirmed', async () => {

        const userData = {
            name: "Juan",
            email: "test1@test.com",
            password: "password"
        }

        const create = await request(server)
                .post('/api/auth/create-account')
                .send(userData)

        const response = await request(server)
                            .post('/api/auth/login')
                            .send({
                                "email": userData.email,
                                "password": userData.password
                            });
        console.log(create.body)
        console.log(response.body.error)
        expect(response.status).toBe(403)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('La cuenta no ha sido confirmada')

        expect(response.status).not.toBe(200)
        expect(response.status).not.toBe(404)
    })*/

    it('should return a 401 error if the password is incorrect', async () => {

        const findOne = (jest.spyOn(User, 'findOne') as jest.Mock)
            .mockResolvedValue({
                id: 1,
                confirmed: true,
                password: "password",
            })

        const checkPassword = (jest.spyOn(authUtils, 'checkPassword' )).mockResolvedValue(false);

        const response = await request(server)
                            .post('/api/auth/login')
                            .send({
                                "email": "test@test.com",
                                "password": "password"
                            });
        

        expect(response.status).toBe(401)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Password incorrecto')

        expect(response.status).not.toBe(403)
        expect(response.status).not.toBe(404)

        expect(findOne).toHaveBeenCalledTimes(1)
        expect(checkPassword).toHaveBeenCalledTimes(1)
    })

    it('should return a JWT', async () => {

        const findOne = (jest.spyOn(User, 'findOne') as jest.Mock)
            .mockResolvedValue({
                id: 1,
                confirmed: true,
                password: "hashedpassword",
            })

        const checkPassword = (jest.spyOn(authUtils, 'checkPassword' )).mockResolvedValue(true);

        const generateJWT = jest.spyOn(jwtUtils, 'generateJWT').mockReturnValue('jwt_token')

        const response = await request(server)
                            .post('/api/auth/login')
                            .send({
                                "email": "test@test.com",
                                "password": "correctPassword"
                            });
        

        expect(response.status).toBe(200)
        expect(response.body).toEqual('jwt_token')

        expect(findOne).toHaveBeenCalled()
        expect(findOne).toHaveBeenCalledTimes(1)

        expect(generateJWT).toHaveBeenCalled()
        expect(generateJWT).toHaveBeenCalledTimes(1)
        expect(generateJWT).toHaveBeenCalledWith(1)

        expect(checkPassword).toHaveBeenCalled()
        expect(checkPassword).toHaveBeenCalledTimes(1)
        expect(checkPassword).toHaveBeenCalledWith('correctPassword', 'hashedpassword')
    })
})

let jwt: string
async function authenticateUser() {
    const response = await request(server)
                            .post('/api/auth/login')
                            .send({
                                email: "test@test.com",
                                password: "password"
                            })
    jwt = response.body
    expect(response.status).toBe(200)
}

describe('GET /api/budgets', () => {

    

    beforeAll(() => {
        jest.restoreAllMocks() //restaura las funciones de los jest.spy a si implementacion original
    })

    beforeEach(async () => {
        await authenticateUser()
    })

    it('should reject unauthenticatd access to budgets without a jwt', async () => {
        const response = await request(server)
                            .get('/api/budgets')

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('No autorizado')

    })

    it('should reject unauthenticatd access to budgets without a valid jwt', async () => {
        const response = await request(server)
                            .get('/api/budgets')
                            .auth('not_valid', {type: 'bearer'})

        expect(response.status).toBe(500)
        expect(response.body.error).toBe('Token no válido')

    })

    it('should allow authenticated access to budgets with a valid jwt', async () => {
        const response = await request(server)
                            .get('/api/budgets')
                            .auth(jwt, {type: 'bearer'})

        expect(response.body).toHaveLength(0)
        expect(response.status).not.toBe(401)
        expect(response.body.error).not.toBe('No autorizado')

    })
})

describe('POST /api/budgets', () => {

    beforeEach(async () => {
        await authenticateUser()
    })

    it('should reject unauthenticatd post request to budgets without a jwt', async () => {
        const response = await request(server)
                            .post('/api/budgets')

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('No autorizado')

    })

    it('should display validation when the form is submitted with invalid data', async () => {
        const response = await request(server)
                            .post('/api/budgets')
                            .auth(jwt, {type: 'bearer'})
                            .send({})

        expect(response.status).toBe(400)
        expect(response.body.errors).toHaveLength(4)

    })

})


