"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ftpStorage = void 0;
const basic_ftp_1 = require("basic-ftp");
const node_crypto_1 = __importDefault(require("node:crypto"));
const node_path_1 = __importDefault(require("node:path"));
const node_stream_1 = require("node:stream");
class FTPStorage {
    constructor(_a) {
        var { basePath, getDestination, getFileName, debug: logging } = _a, options = __rest(_a, ["basePath", "getDestination", "getFileName", "debug"]);
        this.options = {
            getDestination() {
                return "/";
            },
            getFileName(_, file) {
                return (node_crypto_1.default.randomBytes(16).toString("hex") + node_path_1.default.extname(file.originalname));
            },
        };
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
    getClient() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new basic_ftp_1.Client();
            if (this.options.debug) {
                client.ftp.verbose = true;
            }
            yield client.access(this.accessOptions);
            return client;
        });
    }
    _handleFile(req, file, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.getClient();
            try {
                const fileStream = new node_stream_1.Readable();
                fileStream.push(file.buffer);
                fileStream.push(null);
                let [destination, filename] = yield Promise.all([
                    this.options.getDestination(req, file),
                    this.options.getFileName(req, file),
                ]);
                if (this.options.basePath) {
                    destination = node_path_1.default.join(this.options.basePath, destination);
                }
                const filePath = node_path_1.default.join(destination, filename);
                yield client.ensureDir(filePath);
                const response = yield client.uploadFrom(fileStream, filePath);
                if (this.options.debug) {
                    console.log(`=========== ===========`);
                    console.debug(`FTP UPLOAD RESPONSE: \n`, response);
                    console.log(`=========== ===========`);
                }
                const info = Object.assign(Object.assign({}, file), { filename,
                    destination, path: filePath });
                return callback(null, info);
            }
            catch (error) {
                if (this.options.debug) {
                    console.log(`=========== ===========`);
                    console.error(`FTP UPLOAD FAILED: \n`, error);
                    console.log(`=========== ===========`);
                }
                return callback(error);
            }
            finally {
                client.close();
            }
        });
    }
    _removeFile(req, file, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.getClient();
            try {
                yield client.remove(file.path);
            }
            finally {
                client.close();
            }
        });
    }
}
const ftpStorage = (options) => new FTPStorage(options);
exports.ftpStorage = ftpStorage;
