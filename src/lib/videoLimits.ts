import { toast } from 'sonner';

// Hard cap to keep storage costs sane and protect mobile users on poor networks.
// User chose to defer transcoding for now and just enforce a size limit.
export const MAX_VIDEO_MB = 50;
export const MAX_IMAGE_MB = 10;

/**
 * Validate a single uploaded file. Returns true if it's OK to proceed,
 * false (and shows a toast) if it exceeds the limit.
 */
export function isFileSizeOk(file: File): boolean {
  const isVideo = file.type.startsWith('video/');
  const limitMb = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > limitMb) {
    toast.error(
      `${isVideo ? 'Video' : 'File'} is ${sizeMb.toFixed(1)}MB. Max ${limitMb}MB. ` +
      (isVideo
        ? 'Please compress your video (try HandBrake, CapCut, or your phone\'s built-in compressor) and try again.'
        : 'Please use a smaller file.')
    );
    return false;
  }
  return true;
}