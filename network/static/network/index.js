document.addEventListener('DOMContentLoaded', function() {
    // Gain control of necessary DOM elements
    const postForm = document.getElementById('post-form');
    const postsDiv = document.querySelector('.posts-div');
    const toggleFollowBtn = document.getElementById('toggle-follow-btn');
    const likeBtn = document.getElementById('like-btn');

    // Handle post form submission
    if (postForm) {
        postForm.addEventListener('submit', function(e) {
            e.preventDefault();
            post();
        });
    }

    // Handle follow toggling
    if (toggleFollowBtn) {
        toggleFollowBtn.addEventListener('click', async (event) => {
            const username = event.target.dataset.username;
            const isFollowing = event.target.dataset.isfollowing === 'true'; // Convert to bool
            console.log('isFollowing:', isFollowing, typeof isFollowing); // Debug
            if (!username) {
                console.log(`Couldn't find username`);
                return;
            }
            toggleFollowBtn.disabled = true; // Disable button while fetching API
            const result = await toggleFollow(username, isFollowing);
            if (result.success) {
                if (result.following) {
                    // TODO: change to error div
                    alert('Successfully followed user')
                } else {
                    // TODO: change to error div
                    alert('Successfully unfollowed user')
                }
                // Update follower count on profile page
                const followerCount = document.getElementById('follower-count');
                followerCount.innerText = `Followers: ${result.followerCount}`;
                toggleFollowBtn.innerText = result.following ? 'Unfollow' : 'Follow';
                event.target.dataset.isfollowing = result.following.toString();
            } else {
                // TODO: change to error div
                alert(`Error: ${result.error}`);
            }
            toggleFollowBtn.disabled = false; // Restore button
        });
    }  

    // Handle post edits
    if (postsDiv) {
        postsDiv.querySelectorAll('.edit-btn').forEach(element => {
            element.addEventListener('click', (event) => { // Add event listeners to each btn
                const postDiv = event.target.closest('.post-div');
                let postText = postDiv.querySelector('.post-text').innerHTML; // Grab post text
                const postTextDiv = postDiv.querySelector('.post-text-div');
                const editBtn = postDiv.querySelector('.edit-btn');
                const editFormDiv = postDiv.querySelector('.edit-form-div');
                // Toggle off original text display and edit button
                postTextDiv.style.display = 'none';
                editBtn.style.display = 'none';
        
                if (!postDiv.querySelector('.edit-form')) {
                    // Take control of post-div here and display form
                    editFormDiv.innerHTML = // Refactor to create elements programmatically using DOM manipulation
                    
                    `<form class="edit-form">
                        <textarea class="form-textarea" id="edit-content" rows="5" cols="50" required>${postText}</textarea>
                        <div>
                            <button id="edit-post-save-btn" class="btn btn-primary">Save</button>
                            <a id="edit-post-cancel-btn" class="btn btn-outline-secondary">Cancel</a>
                        </div>
                    </form>`
        
                    const editForm = postDiv.querySelector('.edit-form');
                    editForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const updatedContent = editForm.querySelector('#edit-content').value;
                        const postId = element.dataset.id;
                        const result = await editPost(postId, updatedContent);
                        if (result.success) { // Ensure result has been successfully retrieved
                            // Update UI with new post information without reloading
                            postDiv.querySelector('.post-text').innerHTML = result.post.content;
                            postDiv.querySelector('.edited-timestamp-txt').innerHTML = `(edited ${result.post.edited_timestamp})`;
                            // Toggle on default post display and edit button
                            postTextDiv.style.display = 'block';
                            editBtn.style.display = 'block';
                            editFormDiv.innerHTML = ''; // Hide form
                        } else {
                            alert(`Error: ${result.error}`)
                        }
                    });
        
                    postDiv.querySelector('#edit-post-cancel-btn').addEventListener('click', () => {
                        editFormDiv.innerHTML = '';
                        postTextDiv.style.display = 'block';
                        editBtn.style.display = 'block';
                    })
                }
            });
        });
        // Handle likes
        postsDiv.querySelectorAll('.like-btn').forEach(element => {
            // Change to broken heart emoji when hovering over the dislike button
            element.addEventListener('mouseenter', () => {
                element.innerText = (element.dataset.liked === 'true') ? '💔' : '❤️';
            });
            element.addEventListener('mouseleave', () => {
                element.innerText = '❤️';
            })

            element.addEventListener('click', async (event) => {
                // Object destructuring learned from WebDevSimplified: # https://www.youtube.com/watch?v=NIq3qLaHCIs&t=424s
                const { id: postId } = event.target.dataset;
                // Disable button to protect from spam clicks
                event.target.disabled = true;

                const result = await likePost(postId);
                if (result.success) {
                    const likeCount = event.target.closest('.post-div').querySelector('.like-count');
                    likeCount.textContent = result.likeCount;

                    event.target.dataset.liked = result.isLiked;
                } else {
                    // TODO: change to error div
                    alert(`Error: ${result.error}`);
                }
                event.target.disabled = false;
            });
        });
        // Handle comments
        postsDiv.querySelectorAll('.comment-btn').forEach(element => {
            element.addEventListener('click', (event) => {
                const postDiv = event.target.closest('.post-div');
                const commentSectionDiv = postDiv.querySelector('.comment-section-div');
                // Display comments and form
                commentSectionDiv.style.display = commentSectionDiv.style.display === 'none' ? 'block' : 'none';
                const commentsDiv = commentSectionDiv.querySelector('.comments-div');
            });
        });
        // Handle submission
        postsDiv.querySelectorAll('.comment-form').forEach(commentForm => {
            commentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const content = commentForm.querySelector('.comment-content').value;
                const postId = commentForm.querySelector('.submit-comment-btn').dataset.id;
                const postDiv = commentForm.closest('.post-div');
                const commentsDiv = commentForm.closest('.comment-section-div').querySelector('.comments-div');
                const result = await comment(postId, content);
                if (result.success) { // Ensure result has been successfully retrieved
                    // Create comment div
                    const commentDiv = document.createElement('div');
                    commentDiv.classList.add('comment');
                    // Create header div
                    const commentHeaderDiv = document.createElement('div');
                    commentHeaderDiv.classList.add('comment-header-div');
                    // Create link to user's profile
                    const profileLink = document.createElement('a');
                    profileLink.classList.add('post-header-txt');
                    profileLink.href = `/profile/${result.comment.username}`;
                    profileLink.textContent = result.comment.username;
                    commentHeaderDiv.appendChild(profileLink);
                    // Create timestamp
                    const timestamp = document.createElement('p');
                    timestamp.classList.add('timestamp-txt');
                    timestamp.textContent = new Date(result.comment.timestamp).toLocaleString();
                    commentHeaderDiv.appendChild(timestamp);

                    commentDiv.appendChild(commentHeaderDiv);
                    // Create comment text
                    const commentText = document.createElement('p');
                    commentText.textContent = result.comment.text;
                    commentDiv.appendChild(commentText);
                    // Insert new comment at the top of the comments section
                    commentsDiv.prepend(commentDiv);
                    
                    commentForm.querySelector('.comment-content').value = '';
                    const commentCount = postDiv.querySelector('.comment-count');
                    commentCount.textContent = parseInt(commentCount.textContent) + 1;
                } else {
                    commentForm.querySelector('.comment-error-message').textContent = result.error;
                }
            })
        })
    }
    
});
/*
API Endpoints
*/
const post = async () => {
    try {
        const content = document.getElementById('content').value;
        if (!content) {
            alert('Post content cannot be empty!');
            return;
        }
        const response = await fetch('/post', {
            method: 'POST',
            body: JSON.stringify({
                content: content
            })
        });
        const data = await response.json();
        if (response.ok) {
            document.querySelector('#content').value = '';
            console.log('Post shared successfully!');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to submit post. Check console for details.');
        return false;
    }
}

const editPost = async (postId, updatedContent) => {
    try {
        const response = await fetch(`/post/${postId}`, {
            method: 'PUT',
            body: JSON.stringify({
                updatedContent: updatedContent,
            })
        });
        const data = await response.json();
        if (response.ok && data.message) {
            return { success: true, post: data.post };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.log('Error:', error);
        return { success: false, error: 'Failed to update post' };
    }
}

const comment = async (postId, content) => {
    try {
        const response = await fetch(`/post/${postId}/comment`, {
            method: 'POST',
            body: JSON.stringify({
                content: content
            })
        });
        const data = await response.json();
        if (response.ok) {
            return { success: true, comment: data.comment }
        } else {
            return { success: false, error: data.error }
        }
    } catch (error) {
        console.log('Error:', error);
        return { success: false, error: 'Failed to post comment' };
    }
}

const likePost = async (postId) => {
    try {
        const response = await fetch(`/post/${postId}/like`, {
            method: 'POST',
        });
        const data = await response.json();
        if (response.ok) {
            return {
                message: data.message,
                success: true,
                isLiked: data.is_liked,
                likeCount: data.like_count
            }
        } else {
            return { success: false, error: data.error }
        }
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error: error.message }
    }
}

const toggleFollow = async (username, isFollowing) => {
    try {
        // const isFollowingBool = isFollowing === 'true';
        const method = isFollowing ? 'DELETE' : 'POST';
        const endpoint = isFollowing ? `/profile/${username}/unfollow` : `/profile/${username}/follow`;
        const response = await fetch(endpoint,{
            method: method,
        });
        const data = await response.json();
        if (response.ok) {
            return {
                message: data.message,
                success: true,
                following: data.following,
                followerCount: data.follower_count
            };
        } else {
            return { success: false, error: data.error }
        }
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error: error.message }
    }
}