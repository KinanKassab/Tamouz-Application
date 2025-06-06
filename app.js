const form = document.getElementById('attendanceForm'); 
const nameInput = document.getElementById('name'); 
const list = document.getElementById('attendanceList'); 

// تحميل البيانات من localStorage أو إنشاء مصفوفة جديدة
const data = JSON.parse(localStorage.getItem('attendance')) || [];

function loadAttendance() { 
  list.innerHTML = data.map(name => `<p>${name}</p>`).join(''); 
} 

form.addEventListener('submit', (e) => {
  e.preventDefault(); 
  const name = nameInput.value.trim(); 
  if (name) { 
    data.push(name); 
    localStorage.setItem('attendance', JSON.stringify(data)); 
    nameInput.value = ''; 
    loadAttendance(); 
  } 
}); 

loadAttendance(); 

if ('serviceWorker' in navigator) { 
  navigator.serviceWorker.register('service-worker.js') 
    .then(() => {
      console.log('✔️ Service Worker تم تسجيله بنجاح');
    })
    .catch(err => {
      console.error('❌ فشل تسجيل Service Worker:', err);
    }); 
}
