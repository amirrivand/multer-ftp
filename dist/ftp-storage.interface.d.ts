import type { AccessOptions } from "basic-ftp";
import { Request } from "express";
export interface FTPOptions extends AccessOptions {
    basePath?: string;
    debug?: true;
    getDestination: (req: Request, file: Express.Multer.File) => Promise<string> | string;
    getFileName: (req: Request, file: Express.Multer.File) => Promise<string> | string;
}
//# sourceMappingURL=ftp-storage.interface.d.ts.map