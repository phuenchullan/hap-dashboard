import { Service } from '@angular/core';
import { environment } from '../../../../environments/environment';


@Service()
export class Auth {

    async signIn(username: number, password: string){
        try {
            const response = await fetch(`${ environment.apiUrl }/auth/sign-in`, {
                method: 'POST',
                body: JSON.stringify({ username, password }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (response.ok) {
                return data;
            }
            return {
                message: 'Error al iniciar sesión',
            };
        } catch (error) {
            return {
                message: 'Error al iniciar sesión',
            };
        }
    }

}
