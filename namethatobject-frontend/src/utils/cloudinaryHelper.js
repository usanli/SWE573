export const getCloudinaryUrl = (path) => {
  if (!path) return null;
  
  // If it's already a full URL, clean it up
  if (path.startsWith('http')) {
    // Fix duplicate image/upload and ensure https
    path = path.replace('http://', 'https://');
    path = path.replace('/image/upload/image/upload/', '/image/upload/');
    return path;
  }
  
  // If it's a Cloudinary path, construct the full URL
  // Remove leading /image/upload if it exists
  if (path.startsWith('/image/upload/')) {
    path = path.substring('/image/upload/'.length);
  }
  return `https://res.cloudinary.com/dbrvvzoys/image/upload/${path}`;
};

export const getProfilePicture = (user) => {
  if (!user) return null;
  
  if (user.profile_picture) {
    return getCloudinaryUrl(user.profile_picture);
  }
  
  // Return default avatar if no profile picture
  return `https://ui-avatars.com/api/?name=${user.username}&background=random&size=128`;
}; 