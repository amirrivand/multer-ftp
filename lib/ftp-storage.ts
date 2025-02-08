import { AccessOptions, Client } from "basic-ftp";
import { Request } from "express";
import { StorageEngine } from "multer";
import crypto from "node:crypto";
import path from "node:path";
import { Readable } from "node:stream";
import { FTPOptions } from "./ftp-storage.interface";

class FTPStorage implements StorageEngine {
  private options: Omit<FTPOptions, keyof AccessOptions> = {
    getDestination() {
      return "/";
    },
    getFileName(_, file) {
      return (
        crypto.randomBytes(16).toString("hex") + path.extname(file.originalname)
      );
    },
  };
  private accessOptions: AccessOptions;

  constructor({
    basePath,
    getDestination,
    getFileName,
    debug: logging,
    ...options
  }: FTPOptions) {
    this.accessOptions = options;
    if (basePath) {
      this.options.basePath = basePath;
    }
    if (getDestination !== undefined) {
      this.options.getDestination = getDestination;
    }
    if (getFileName !== undefined) {
      this.options.getFileName = getFileName;
    }

    if (logging) {
      this.options.debug = true;
    }
  }

  private async getClient() {
    const client = new Client();
    if (this.options.debug) {
      client.ftp.verbose = true;
    }
    await client.access(this.accessOptions);
    return client;
  }

  async _handleFile(
    req: Request,
    file: Express.Multer.File,
    callback: (error?: any, info?: Partial<Express.Multer.File>) => void
  ): Promise<void> {
    const client = await this.getClient();
    try {
      const fileStream = new Readable();
      fileStream.push(file.buffer);
      fileStream.push(null);

      let [destination, filename] = await Promise.all([
        this.options.getDestination(req, file),
        this.options.getFileName(req, file),
      ]);

      if (this.options.basePath) {
        destination = path.join(this.options.basePath, destination);
      }

      const filePath: string = path.join(destination, filename);
      await client.ensureDir(filePath);

      const response = await client.uploadFrom(fileStream, filePath);
      if (this.options.debug) {
        console.log(`=========== ===========`);
        console.debug(`FTP UPLOAD RESPONSE: \n`, response);
        console.log(`=========== ===========`);
      }

      const info: Partial<Express.Multer.File> = {
        ...file,
        filename,
        destination,
        path: filePath,
      };

      return callback(null, info);
    } catch (error) {
      if (this.options.debug) {
        console.log(`=========== ===========`);
        console.error(`FTP UPLOAD FAILED: \n`, error);
        console.log(`=========== ===========`);
      }
      return callback(error);
    } finally {
      client.close();
    }
  }
  async _removeFile(
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null) => void
  ): Promise<void> {
    const client = await this.getClient();
    try {
      await client.remove(file.path);
    } finally {
      client.close();
    }
  }
}

export const ftpStorage = (options: FTPOptions) => new FTPStorage(options);
