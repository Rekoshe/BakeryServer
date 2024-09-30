import { http, HttpResponse } from 'msw';
import { databaseURI } from '../constants';
import { User } from '../App';

const devUser : User = {
    username : 'dev',
    bio: 'dev bio'
}

export const handlers = [
    // Intercept requests...
    http.post(databaseURI + '/login', () => {
        // ...and respond to them using this JSON response.
        return HttpResponse.json(devUser, {status: 200});
    }),
    http.post(databaseURI + '/logout', () => {
        return HttpResponse.json({message : 'logout successful'}, {status: 200});
    })
]