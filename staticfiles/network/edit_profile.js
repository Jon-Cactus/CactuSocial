document.addEventListener('DOMContentLoaded', function() {
    const editProfileForm = document.getElementById('edit-profile-form');

    if (editProfileForm) {
        const bio = document.getElementById('id_bio');
        const charCount = document.getElementById('char-count');
        bio.addEventListener('input', () => {
            charCount.textContent = bio.value.length;
            if (bio.value.length === 512) {
                charCount.style.color = '#ff903c';
            }
        })
    }
})