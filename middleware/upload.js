import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Storage for generic project files/images
const projectStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "portfolio_projects",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "pdf"],
  },
});

// Storage for profile avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "portfolio_avatars",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

export const uploadProjects = multer({ storage: projectStorage });
export const uploadAvatar = multer({ storage: avatarStorage });
