const openCameraBtn = document.getElementById('openCameraBtn');
const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
const viewPhotosBtn = document.getElementById('viewPhotosBtn');
const cameraModal = document.getElementById('cameraModal');
const galleryModal = document.getElementById('galleryModal');
const lightboxModal = document.getElementById('lightboxModal');
const closeCameraBtn = document.getElementById('closeCameraBtn');
const closeGalleryBtn = document.getElementById('closeGalleryBtn');
const closeLightboxBtn = document.getElementById('closeLightboxBtn');
const cameraVideo = document.getElementById('cameraVideo');
const photoCanvas = document.getElementById('photoCanvas');
const captureBtn = document.getElementById('captureBtn');
const galleryGrid = document.getElementById('galleryGrid');
const emptyMessage = document.getElementById('emptyMessage');
const lightboxImage = document.getElementById('lightboxImage');
const fileInput = document.getElementById('fileInput');

let photos = JSON.parse(localStorage.getItem('photos') || '[]');
let stream = null;

function triggerVibration(duration = 50) {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration);
  }
}

function savePhotos() {
  localStorage.setItem('photos', JSON.stringify(photos));
}

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });
    cameraVideo.srcObject = stream;
    cameraModal.classList.add('active');
  } catch (error) {
    console.error('Camera access denied:', error);
    alert('Unable to access camera. Please ensure you have granted camera permissions.');
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  cameraVideo.srcObject = null;
  cameraModal.classList.remove('active');
}

function capturePhoto() {
  triggerVibration(100);
  
  const context = photoCanvas.getContext('2d');
  photoCanvas.width = cameraVideo.videoWidth;
  photoCanvas.height = cameraVideo.videoHeight;
  context.drawImage(cameraVideo, 0, 0);
  
  const imageData = photoCanvas.toDataURL('image/jpeg', 0.8);
  photos.unshift({
    id: Date.now(),
    data: imageData,
    timestamp: new Date().toISOString()
  });
  savePhotos();
  
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    z-index: 9999;
    animation: flash 0.3s ease-out forwards;
  `;
  document.body.appendChild(flash);
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes flash {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  setTimeout(() => {
    flash.remove();
    style.remove();
  }, 300);
}

function renderGallery() {
  if (photos.length === 0) {
    emptyMessage.style.display = 'block';
    galleryGrid.querySelectorAll('.gallery-item').forEach(item => item.remove());
    return;
  }
  
  emptyMessage.style.display = 'none';
  galleryGrid.innerHTML = '';
  
  photos.forEach((photo, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `<img src="${photo.data}" alt="Photo ${index + 1}">`;
    item.addEventListener('click', () => openLightbox(photo.data));
    galleryGrid.appendChild(item);
  });
}

function openLightbox(imageSrc) {
  lightboxImage.src = imageSrc;
  lightboxModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightboxModal.classList.remove('active');
  document.body.style.overflow = '';
  lightboxImage.src = '';
}

function handleFileUpload(event) {
  const files = event.target.files;
  if (!files.length) return;
  
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      photos.unshift({
        id: Date.now(),
        data: e.target.result,
        timestamp: new Date().toISOString()
      });
      savePhotos();
      
      if (galleryModal.classList.contains('active')) {
        renderGallery();
      }
    };
    reader.readAsDataURL(file);
  });
  
  fileInput.value = '';
}

openCameraBtn.addEventListener('click', () => {
  startCamera();
});

uploadPhotoBtn.addEventListener('click', () => {
  fileInput.click();
});

viewPhotosBtn.addEventListener('click', () => {
  renderGallery();
  galleryModal.classList.add('active');
});

closeCameraBtn.addEventListener('click', stopCamera);
closeGalleryBtn.addEventListener('click', () => {
  galleryModal.classList.remove('active');
});

closeLightboxBtn.addEventListener('click', closeLightbox);

lightboxModal.addEventListener('click', (e) => {
  if (e.target === lightboxModal) {
    closeLightbox();
  }
});

captureBtn.addEventListener('click', capturePhoto);

fileInput.addEventListener('change', handleFileUpload);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (lightboxModal.classList.contains('active')) {
      closeLightbox();
    } else if (cameraModal.classList.contains('active')) {
      stopCamera();
    } else if (galleryModal.classList.contains('active')) {
      galleryModal.classList.remove('active');
    }
  }
});

renderGallery();
