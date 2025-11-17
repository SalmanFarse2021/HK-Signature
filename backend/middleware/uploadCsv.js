import multer from 'multer';

const storage = multer.memoryStorage();

const csvFilter = (req, file, cb) => {
  const allowed = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only CSV files are allowed'));
};

export const uploadCsv = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: csvFilter,
});

export default uploadCsv;

