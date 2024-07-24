import { google } from 'googleapis';
import fs from 'fs';
import { Readable } from 'stream'; // Import Readable dari modul stream

const drive = google.drive('v3');

export const uploadToGoogleDrive = async (pdfBytes, fileName) => {
    const auth = new google.auth.GoogleAuth({
        keyFile: './services/diklatstp-service-account-file.json',
        scopes: ['https://www.googleapis.com/auth/drive.file']
    });

    const authClient = await auth.getClient();
    google.options({ auth: authClient });

    const fileMetadata = {
        name: fileName,
        parents: ['1ajm9GVBbEjoG4A5eLR-K_67aoG4KHi4y'] // ID folder Google Drive
    };

    // Mengubah buffer menjadi stream
    const bufferStream = new Readable();
    bufferStream.push(pdfBytes);
    bufferStream.push(null); // Menandakan akhir dari stream

    const media = {
        mimeType: 'application/pdf',
        body: bufferStream // Menggunakan stream
    };

    const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    });

    return response.data.id;
};
