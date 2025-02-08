import { Request } from "express";
import { StorageEngine } from "multer";
import { FTPOptions } from "./ftp-storage.interface";
declare class FTPStorage implements StorageEngine {
    private options;
    private accessOptions;
    constructor({ basePath, getDestination, getFileName, debug: logging, ...options }: FTPOptions);
    private getClient;
    _handleFile(req: Request, file: Express.Multer.File, callback: (error?: any, info?: Partial<Express.Multer.File>) => void): Promise<void>;
    _removeFile(req: Request, file: Express.Multer.File, callback: (error: Error | null) => void): Promise<void>;
}
export declare const ftpStorage: (options: FTPOptions) => FTPStorage;
export {};
//# sourceMappingURL=ftp-storage.d.ts.map