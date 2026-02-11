/**
 * File storage operations using Firebase Storage or in-memory fallback.
 */

import {
    storage,
    hasFirebase,
} from '../lib/firebase';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from 'firebase/storage';
import {
    fileUrls,
} from './backendServiceBase';

const BUCKET_PATH = 'user-files';

export async function uploadFile(uid: string, path: string, file: File | Blob): Promise<string> {
    const fullPath = `${BUCKET_PATH}/${uid}/${path}`;
    if (hasFirebase && storage) {
        const fileRef = ref(storage, fullPath);
        await uploadBytes(fileRef, file);
        return getDownloadURL(fileRef);
    }
    const url = URL.createObjectURL(file);
    fileUrls.set(fullPath, url);
    return url;
}

export async function getFileUrl(uid: string, path: string): Promise<string> {
    const fullPath = `${BUCKET_PATH}/${uid}/${path}`;
    if (hasFirebase && storage) {
        try {
            const fileRef = ref(storage, fullPath);
            return await getDownloadURL(fileRef);
        } catch {
            return '';
        }
    }
    return fileUrls.get(fullPath) ?? '';
}

export async function deleteFile(uid: string, path: string): Promise<void> {
    const fullPath = `${BUCKET_PATH}/${uid}/${path}`;
    if (hasFirebase && storage) {
        try {
            const fileRef = ref(storage, fullPath);
            await deleteObject(fileRef);
        } catch {
            // ignore
        }
        return;
    }
    fileUrls.delete(fullPath);
}
