import express from 'express'
import axios from 'axios'
import jwt from 'jsonwebtoken'

import { GOOGLE_AUTHORIZATION_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_OAUTH_CALLBACK_URL, JWT_SECRET } from '../config';
import { AppDataSource } from '../db/dataSource';
import { Mail } from '../entities/mail.entity';
import { Admin, Author, Library, User } from '../entities';
import { generatePassword } from '../utils';
import { Role } from '../utils/types';


const mailRepository = AppDataSource.getRepository(Mail)
const userRepository = AppDataSource.getRepository(User)
const authorRepository = AppDataSource.getRepository(Author)
const adminRepository = AppDataSource.getRepository(Admin)
const googleAuthRouter = express.Router()


googleAuthRouter.get('/google', (req, res) => {
    // Create Google OAuth URL
    const googleAuthUrl = new URL(GOOGLE_AUTHORIZATION_URL);

    googleAuthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.set('redirect_uri', GOOGLE_OAUTH_CALLBACK_URL);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'profile email');
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'consent');

    // Redirect user to Google
    res.redirect(googleAuthUrl.toString());
});

googleAuthRouter.get('/google/callback', async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).send('No authorization code received');
        }

        const tokenResponse = await axios.post<{ access_token: string, id_token: string }>('https://oauth2.googleapis.com/token', null, {
            params: {
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: GOOGLE_OAUTH_CALLBACK_URL
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, id_token } = tokenResponse.data

        const userResponse = await axios.get<{ id: string, email: string, name: string, picture: string }>('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        const googleUser = userResponse.data;

        const existingUserMail = await mailRepository.findOne({ where: { mail: googleUser.email } });
        let userData: { id: string, username: string, role: Role }
        let token: string

        if (!existingUserMail) {
            const randomCode = generatePassword();

            const library = new Library
            library.libraryBooks = []

            const { userId, username } = await userRepository.save(userRepository.create({ username: googleUser.name + randomCode, email: googleUser.email, profilePhotoUrl: googleUser.picture, library: library }))
            await mailRepository.save(mailRepository.create({mail: googleUser.email, verified: true, userRole: Role.USER}))
            userData = { id: userId, username, role: Role.USER }
            token = jwt.sign(userData, JWT_SECRET, { expiresIn: '1h' })
           
            return res.json(token);
        } else {
            switch (existingUserMail.userRole) {
                case Role.ADMIN:
                    const admin = await adminRepository.findOne({ where: { email: googleUser.email } });
                   
                    if (!admin) throw new Error('admin not found');
                    
                    userData = { id: admin.adminId, username: admin.username, role: Role.ADMIN }
                    token = jwt.sign(userData, JWT_SECRET, { expiresIn: '1h' })
                    
                    return res.json(token);
                case Role.AUTHOR:
                    const author = await authorRepository.findOne({ where: { email: googleUser.email } });
                    
                    if (!author) throw new Error('author not found');
                    
                    userData = { id: author.authorId, username: author.username, role: Role.AUTHOR }
                    token = jwt.sign(userData, JWT_SECRET, { expiresIn: '1h' })
                    
                    return res.json(token);
                case Role.USER:
                    const user = await userRepository.findOne({ where: { email: googleUser.email } });
                    
                    if (!user) throw new Error('user not found');
                   
                    userData = { id: user.userId, username: user.username, role: Role.USER }
                    token = jwt.sign(userData, JWT_SECRET, { expiresIn: '1h' })
                    
                    return res.json(token);
            }
        }
    } catch (e) {
        console.log(e)
    }
})

export default googleAuthRouter