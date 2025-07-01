const BASE_URL = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const BUCKET = import.meta.env.VITE_SUPABASE_PROJECT_BUCLKET;

export const getFlagEmoji = (countryCode) => {
  return String.fromCodePoint(
    ...countryCode.toUpperCase().split('').map(c => 0x1F1E6 - 65 + c.charCodeAt(0))
  );
};

export const validateFileSize = (file, maxSize) => {
  if (!file) return { isValid: false, message: "No file selected" };

  if (file.size > maxSize) {
    return {
      isValid: false,
      message: `File size exceeds the limit of ${maxSize / (1024 * 1024)}MB.`,
    };
  }

  return { isValid: true, message: "" };
};

export const formatImagePath = (path) => {
  const prefix = `${BASE_URL}/${BUCKET}/`;
  if (path.startsWith(prefix)) {
    return path.slice(prefix.length);
  }
  return path;
};


export function byteArrayToBase64(byteArray) {
  const blob = new Blob([byteArray], { type: 'image/jpeg' });
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export function formatDate(dateString) {
  const createdDate = new Date(dateString);
  const now = new Date();

  const msInHour = 1000 * 60 * 60;
  const diffInHours = (now - createdDate) / msInHour;

  if (diffInHours < 24) {
    // Format as H:MM AM/PM
    const options = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return createdDate.toLocaleTimeString(undefined, options);
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    // Format as DD/MM/YYYY
    const day = String(createdDate.getDate()).padStart(2, '0');
    const month = String(createdDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = createdDate.getFullYear();
    return `${day}/${month}/${year}`;
  }
}

export function formatTimestamp(timestamp) {
  // Step 1: Trim the microseconds (if any) to make it compatible with JavaScript Date
  const trimmedTimestamp = timestamp.split('.')[0];

  // Step 2: Create a Date object
  const date = new Date(trimmedTimestamp);

  // Step 3: Check if the Date object is valid
  if (isNaN(date.getTime())) {
    return "Invalid date"; // Return an error message if the date is invalid
  }

  // Step 4: Format the Date object as YYYY-MM-DD HH:mm:ss
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');

  const period = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? String(hours).padStart(2, '0') : '12';

  return `${day}/${month}/${year} ${hours}:${minutes} ${period}`;
}

export function formatTimestampToTime(timestamp) {
  // Step 1: Trim the microseconds (if any) to make it compatible with JavaScript Date
  const trimmedTimestamp = timestamp.split('.')[0];

  // Step 2: Create a Date object
  const date = new Date(trimmedTimestamp);

  // Step 3: Check if the Date object is valid
  if (isNaN(date.getTime())) {
    return "Invalid date"; // Return an error message if the date is invalid
  }

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');

  const period = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? String(hours).padStart(2, '0') : '12';

  return `${hours}:${minutes} ${period}`;
}

export function moveToFirst(arr, predicate) {
  const index = arr.findIndex(predicate);
  if (index === -1) return arr;

  const [item] = arr.splice(index, 1);
  return [item, ...arr];
};

export function getMediaExtension(filename) {
  if (!filename || typeof filename !== "string") return null;

  return filename.split('.').pop().toLowerCase();
}


export function getMediaTypeFromExtension(filename) {
  const extension = getMediaExtension(filename);

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg'];
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'];
  const pdfExtensions = ['pdf'];
  const docExtensions = ['doc', 'docx', 'odt'];

  if (imageExtensions.includes(extension)) return 'IMAGE';
  if (audioExtensions.includes(extension)) return 'AUDIO';
  if (pdfExtensions.includes(extension)) return 'PDF';
  if (docExtensions.includes(extension)) return 'DOCX';

  return 'TEXT';
}

export function getReadableFileSize(file) {
  if (!file || typeof file.size !== "number") return null;

  const sizeInBytes = file.size;

  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let readableSize = sizeInBytes;

  while (readableSize >= 1024 && unitIndex < units.length - 1) {
    readableSize /= 1024;
    unitIndex++;
  }

  return `${readableSize.toFixed(2)} ${units[unitIndex]}`;
}

export function getFileNameFromPath(path) {
  if (!path) return "";
  return path.split(/[/\\]/).pop();
};


export function formatAudioTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};


export function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
