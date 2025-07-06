document.addEventListener('DOMContentLoaded', function() {
    const toggleFollowBtn = document.getElementById('toggle-follow-btn');

    // Handle follow toggling
    if (toggleFollowBtn) {
        toggleFollowBtn.addEventListener('click', async (event) => {
            const username = event.target.dataset.username;
            const isFollowing = event.target.dataset.isfollowing === 'true'; // Convert to bool
            if (!username) {
                console.log(`Couldn't find username`);
                return;
            }
            toggleFollowBtn.disabled = true; // Disable button while fetching API
            const result = await toggleFollow(username, isFollowing);
            if (result.success) {
                const messageDiv = document.getElementById('message-div');
                if (result.following) {
                    messageDiv.style.display = 'block';
                    messageDiv.textContent = 'Successfully followed user!';
                } else {
                    messageDiv.style.display = 'block';
                    messageDiv.textContent = 'Successfully unfollowed user!';
                }
                // Hide message div after 3 seconds
                setTimeout(() => {
                    messageDiv.style.display = 'none';
                }, 3000);
                // Update follower count on profile page
                const followerCount = document.getElementById('follower-count');
                followerCount.innerText = `${result.followerCount}`;
                toggleFollowBtn.innerText = result.following ? 'Unfollow' : 'Follow';
                // Remove all color classes so that when the correct is added it will display properly
                toggleFollowBtn.classList.remove('submit-btn', 'cancel-btn');
                // Add correct class for follow btn
                toggleFollowBtn.classList.add(result.following ? 'cancel-btn' : 'submit-btn');
                event.target.dataset.isfollowing = result.following.toString();
            } else {
                // TODO: change to error div
                alert(`Error: ${result.error}`);
            }
            toggleFollowBtn.disabled = false; // Restore button
        });
    }
})