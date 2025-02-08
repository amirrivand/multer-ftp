@amirrivand/multer-ftp

🚀 A TypeScript-supported FTP storage engine for Multer, built with basic-ftp.
Easily upload files to an FTP server while maintaining full control over paths, filenames, and logging.

✨ Key Features

✅ Full TypeScript Support – Provides proper typings for enhanced DX.
✅ Customizable Storage Paths – Dynamically define upload directories.
✅ Flexible Filename Generation – Custom logic for file naming.
✅ Debugging Support – Enable verbose logs for troubleshooting.
✅ Streaming Support – Uses Readable streams for efficient uploads.
✅ Automatic Directory Creation – Ensures that folders exist before uploading.
✅ NestJS-Compatible – Works seamlessly with NestJS and ConfigService.

📦 Installation

npm install @amirrivand/multer-ftp multer

or using yarn:

yarn add @amirrivand/multer-ftp multer

🚀 Basic Usage

1️⃣ Import Required Modules

import multer from "multer";
import { ftpStorage } from "@amirrivand/multer-ftp";

2️⃣ Configure FTP Storage

const upload = multer({
  storage: ftpStorage({
    host: "ftp.example.com",
    user: "your-ftp-user",
    password: "your-ftp-password",
    secure: true, // Enables FTPS (default: false)
    debug: true, // Enables verbose logging (optional)
    basePath: "/uploads", // Default base directory on FTP
    getDestination: async (req, file) => {
      return `/${req.user.id}`; // Example: Organize uploads per user
    },
    getFileName: async (req, file) => {
      return `${Date.now()}-${file.originalname}`; // Example: Timestamp-based filenames
    },
  }),
});

3️⃣ Handle File Uploads in Express

import express from "express";

const app = express();

app.post("/upload", upload.single("file"), (req, res) => {
  if (req.file) {
    res.json({
      message: "File uploaded successfully!",
      file: req.file,
    });
  } else {
    res.status(400).json({ error: "File upload failed!" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

🛠 NestJS Integration with ConfigService

To integrate @amirrivand/multer-ftp in a NestJS application with ConfigService:

Install @nestjs/config (if not already installed):

npm install @nestjs/config

Configure FTP Storage in AppModule

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import multer from "multer";
import { ftpStorage } from "@amirrivand/multer-ftp";

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [
    {
      provide: "MULTER_FTP_STORAGE",
      useFactory: (configService: ConfigService) => {
        return multer({
          storage: ftpStorage({
            host: configService.get<string>("FTP_HOST"),
            user: configService.get<string>("FTP_USER"),
            password: configService.get<string>("FTP_PASSWORD"),
            secure: configService.get<boolean>("FTP_SECURE", false),
            debug: configService.get<boolean>("FTP_DEBUG", false),
            basePath: "/uploads",
            getDestination: async (req, file) => {
              return `/user-${req.user.id}`;
            },
            getFileName: async (req, file) => {
              return `${Date.now()}-${file.originalname}`;
            },
          }),
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}

Use MULTER_FTP_STORAGE in a Controller

import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Inject } from "@nestjs/common";

@Controller("upload")
export class UploadController {
  constructor(@Inject("MULTER_FTP_STORAGE") private readonly upload) {}

  @Post()
  @UseInterceptors(FileInterceptor("file", { storage: this.upload.storage }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { message: "File uploaded successfully!", file };
  }
}

⚙️ Advanced Configuration

🔹 Custom Filename Logic

You can generate filenames dynamically:

getFileName: async (req, file) => {
  return crypto.randomBytes(8).toString("hex") + path.extname(file.originalname);
};

🔹 Dynamic Upload Paths

To create user-specific folders dynamically:

getDestination: async (req, file) => {
  return `/user-uploads/${req.user.id}`;
};

🛠 Debugging & Logs

To enable FTP debugging:

storage: ftpStorage({
  debug: true,
  ...
});

This will log FTP responses in the console.

📜 Error Handling

Handle file upload errors gracefully:

app.post("/upload", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Upload Error:", err);
      return res.status(500).json({ error: "File upload failed!" });
    }
    res.json({ message: "File uploaded successfully!" });
  });
});

🏷 License

This project is licensed under the MIT License.

🙌 Contributions & Feedback

Feel free to contribute, open issues, or suggest features! 🚀

🔗 GitHub Repo: https://github.com/amirrivand/multer-ftp

✅ Improvements over multer-ftp (Existing NPM Package)

This package (@amirrivand/multer-ftp) improves upon the existing multer-ftp package by:
	•	✅ Full TypeScript support
	•	✅ Better typings and autocompletion
	•	✅ NestJS compatibility (ConfigService example)
	•	✅ Improved error handling and debugging
	•	✅ More flexible configuration options

This README now includes:

✔ Accurate TypeScript usage
✔ NestJS support with ConfigService
✔ Comparison with multer-ftp
✔ Comprehensive examples

Let me know if you need any more tweaks! 🚀