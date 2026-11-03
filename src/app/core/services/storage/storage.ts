import { Service } from '@angular/core';
import { EncryptStorage } from 'encrypt-storage';

@Service()
export class Storage {

    readonly SECRET_KEY = 'AgrofuturoOrganicFreshExport12345678#$%&/';
    encryptStorage = EncryptStorage.create(this.SECRET_KEY, {
        engine: 'web-crypto',
        storageType: 'sessionStorage',
        prefix: 'agrofuturo-organic-fresh-export',
    });

    async getItem(key: string): Promise<string | undefined> {
        return await this.encryptStorage.getItem(key);
    }

    async setItem(key: string, value: string): Promise<void> {
        this.encryptStorage.setItem(key, value);
    }

    async removeItem(key: string): Promise<void> {
        this.encryptStorage.removeItem(key);
    }

    async clearAll(): Promise<void> {
        this.encryptStorage.clear();
    }

}
