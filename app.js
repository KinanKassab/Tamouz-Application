const form = document.getElementById('attendanceForm'); 
const nameInput = document.getElementById('name'); 
const list = document.getElementById('attendanceList'); 
 
function loadAttendance() { 
  list.innerHTML = data.map(name = ${name}</p>`).join(''); 
} 
 
form.addEventListener('submit', e =
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
    .then(() =
    .catch(err =, err)); 
} 
