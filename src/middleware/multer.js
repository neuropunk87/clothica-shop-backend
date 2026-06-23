import multer from 'multer';
import createHttpError from 'http-errors';

const allowedImageMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const allowedImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const originalName = file.originalname?.toLowerCase() ?? '';
    const extension = originalName.includes('.')
      ? originalName.slice(originalName.lastIndexOf('.'))
      : '';

    if (
      !allowedImageMimeTypes.has(file.mimetype) ||
      !allowedImageExtensions.has(extension)
    ) {
      return callback(createHttpError(400, 'Only safe image files are allowed'));
    }

    callback(null, true);
  },
});
