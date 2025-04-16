import { transport } from "../config/nodemailer"

type EmailType = {
    name: string
    email: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user: EmailType) => {
        const email = await transport.sendMail({
            from: 'CashTrackr <admin@cashtrackr.com>',
            to: user.email,
            subject: 'CashTrackr - Confirma tu cuenta',
            html: `
                <p>Hola: ${user.name}, has creado tu cuenta en CashTrackr, ya esta casi lista</p>
                <p>Visita el siguiente enlace:</p>
                <a href="#">Confirmar cuenta</a>
                <p>ingresa el código: <b>${user.token}</b></p>
            `

        })
        console.log('Mensaje enviado ', email.messageId)
    }

    static sendPasswordResetToken= async (user: EmailType) => {
        const email = await transport.sendMail({
            from: 'CashTrackr <admin@cashtrackr.com>',
            to: user.email,
            subject: 'CashTrackr - Restablece tu password',
            html: `
                <p>Hola: ${user.name}, has solicitado restablecer tu password</p>
                <p>Visita el siguiente enlace:</p>
                <a href="#">Restablecer password</a>
                <p>ingresa el código: <b>${user.token}</b></p>
            `

        })
        console.log('Mensaje enviado ', email.messageId)
    }
}