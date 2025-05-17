let csrfToken;

document.addEventListener('DOMContentLoaded', function() {
    csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    // Gain control of necessary DOM elements
    const postForm = document.getElementById('post-form');
    const postsDiv = document.querySelector('.posts-div');
    const toggleFollowBtn = document.getElementById('toggle-follow-btn');
    const editProfileForm = document.getElementById('edit-profile-form');

    // Handle post form submission
    if (postForm) {
        const postContent = document.getElementById('post-content');
        const charCount = document.getElementById('char-count');
        postContent.addEventListener('input', () => {
            charCount.textContent = postContent.value.length;
        })
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
    /* TODO: potential refactor with changing scope of certain variables (postDiv for example,
    so that it isn't necessary to check for postsDiv for every action) */
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
                    /* Generate edited post via DOM manipulation to update UI */
                    // Create edit form
                    const editForm = document.createElement('form');
                    editForm.classList.add('edit-form');
                    // Create textarea
                    const editContent = document.createElement('textarea');
                    editContent.classList.add('form-textarea');
                    editContent.id = 'edit-content';
                    editContent.rows = 5;
                    editContent.cols = 50;
                    editContent.required = true;
                    editContent.value = postText;
                    // Create div to contain submit and cancel buttons
                    const div = document.createElement('div');
                    // Create save button
                    const saveBtn = document.createElement('button');
                    saveBtn.classList.add('btn', 'btn-primary');
                    saveBtn.id = 'edit-post-save-btn';
                    saveBtn.textContent = 'Save';
                    // Create cancel button
                    const cancelBtn = document.createElement('a');
                    cancelBtn.classList.add('btn', 'btn-outline-secondary');
                    cancelBtn.id = 'edit-post-cancel-btn';
                    cancelBtn.textContent = 'Cancel';
                    // Append buttons to div
                    div.appendChild(saveBtn);
                    div.appendChild(cancelBtn);
                    // Append textarea and div to the form
                    editForm.appendChild(editContent);
                    editForm.appendChild(div);
                    // Append the form to its container div
                    editFormDiv.appendChild(editForm);
                    
                    editForm.addEventListener('submit', async (event) => {
                        event.preventDefault();
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
                    // TODO: Check if there is a better way to handle this
                    postDiv.querySelector('#edit-post-cancel-btn').addEventListener('click', () => {
                        editFormDiv.innerHTML = '';
                        postTextDiv.style.display = 'block';
                        editBtn.style.display = 'block';
                    });
                }
            });
        });
        // Handle likes
        postsDiv.querySelectorAll('.post-like-btn').forEach(postLikeBtn => {
            // Change to broken heart emoji when hovering over the dislike button
            postLikeBtn.addEventListener('mouseenter', () => {
                postLikeBtn.innerText = postLikeBtn.dataset.liked === 'true' ? '💔' : '❤️';
            });
            postLikeBtn.addEventListener('mouseleave', () => {
                postLikeBtn.innerText = '❤️';
            });

            postLikeBtn.addEventListener('click', async (event) => {
                const postId = event.target.dataset.id;
                const isLiked = event.target.dataset.liked === 'true';
                // Disable button to protect from spam clicks
                event.target.disabled = true;

                const result = await toggleLikePost(postId, isLiked);
                if (result.success) {
                    // update like count UI
                    const likeCount = event.target.closest('.post-div').querySelector('.like-count');
                    likeCount.textContent = result.likeCount;
                    // 
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
                // Toogle display of comment section
                commentSectionDiv.style.display = commentSectionDiv.style.display === 'none' ? 'block' : 'none';
            });
        });
        // Handle comment submission
        postsDiv.querySelectorAll('.comment-form').forEach(commentForm => {
            commentForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const content = commentForm.querySelector('.comment-content').value;
                const postId = commentForm.querySelector('.submit-comment-btn').dataset.id;
                const postDiv = commentForm.closest('.post-div');
                const commentsDiv = commentForm.closest('.comment-section-div').querySelector('.comments-div');
                const result = await comment(postId, content);
                if (result.success) { // Ensure result has been successfully retrieved

                    /* Generate new comment via DOM manipulation to update UI */
                    // Create comment div
                    const commentDiv = document.createElement('div');
                    commentDiv.classList.add('comment-div');
                    // Create header div
                    const commentHeaderDiv = document.createElement('div');
                    commentHeaderDiv.classList.add('comment-header-div');
                    // Create link to user's profile
                    const profileLink = document.createElement('a');
                    profileLink.classList.add('header-txt');
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
            });
        });
        postsDiv.querySelectorAll('.reply-btn').forEach(element => {
            element.addEventListener('click', (event) => {
                const commentDiv = event.target.closest('.comment-div');
                const replySectionDiv = commentDiv.querySelector('.reply-section-div');
                // Toggle display of reply section
                replySectionDiv.style.display = replySectionDiv.style.display === 'none' ? 'block' : 'none';
                element.innerText = replySectionDiv.style.display === 'none' ? `Load ${element.dataset.replycount} replies` : 'Hide';
            });
        });
        postsDiv.querySelectorAll('.reply-form').forEach(replyForm => {
            replyForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const replyText = replyForm.querySelector('.reply-text').value;
                const commentId = replyForm.querySelector('.submit-reply-btn').dataset.id;
                const replySectionDiv = replyForm.closest('.reply-section-div');
                const repliesDiv = replySectionDiv.querySelector('.replies-div');

                const result = await commentReply(commentId, replyText);
                if (result.success) {
                    /* Generate new comment via DOM manipulation to update UI */
                    // Create reply div
                    const replyDiv = document.createElement('div');
                    replyDiv.classList.add('reply-div');
                    // Create reply header div
                    const replyHeaderDiv = document.createElement('div');
                    replyHeaderDiv.classList.add('reply-header-div');
                    // Create span element to contain profile link and replying to text
                    const replyHeader = document.createElement('span');
                    replyHeader.classList.add('reply-header');
                    //Create link to user's profile and replying to text
                    const profileLink = document.createElement('a');
                    profileLink.classList.add('header-txt');
                    profileLink.href = `/profile/${result.commentReply.username}`;
                    profileLink.textContent = result.commentReply.username;
                    const recipientUserText = document.createElement('p');
                    recipientUserText.textContent = `replying to: ${result.commentReply.recipient_username}`;

                    replyHeader.appendChild(profileLink);
                    replyHeader.appendChild(recipientUserText);
                    replyHeaderDiv.appendChild(replyHeader);
                    // Create timestamp
                    const timestamp = document.createElement('p');
                    timestamp.classList.add('timestamp-txt');
                    timestamp.textContent = new Date(result.commentReply.timestamp).toLocaleString();
                    replyHeaderDiv.appendChild(timestamp);
                    
                    replyDiv.appendChild(replyHeaderDiv);
                    // Create reply text
                    const replyTextElement = document.createElement('p');
                    replyTextElement.textContent = result.commentReply.text;
                    replyDiv.appendChild(replyTextElement);
                    // Insert replyDiv to the replies container
                    repliesDiv.prepend(replyDiv);
                } else {
                    replyForm.querySelector('.reply-error-message').textContent = result.error;
                }
            });
        });
        postsDiv.querySelectorAll('.comment-like-btn').forEach(likeBtn => {
            likeBtn.addEventListener('mouseenter', () => {
                likeBtn.innerText = likeBtn.dataset.liked === 'true' ? '💔' : '❤️';
            })
            likeBtn.addEventListener('mouseleave', () => {
                likeBtn.innerText = '❤️';
            })
            likeBtn.addEventListener('click', async (event) => {
                event.target.disabled = true;
                const commentId = likeBtn.dataset.id;
                const isLiked = likeBtn.dataset.liked === 'true';
                console.log(isLiked)
                const result = await toggleLikeComment(commentId, isLiked);
                if (result.success) {
                    likeBtn.dataset.liked = result.isLiked;
                    const likeCount = event.target.closest('.interact-div').querySelector('.like-count');
                    likeCount.textContent = result.likeCount;
                } else {
                    console.log('Error: ', result.error);
                }
                event.target.disabled = false;
            });
        });
    };
    if (editProfileForm) {
        const bio = document.getElementById('id_bio');
        const charCount = document.getElementById('char-count');
        bio.addEventListener('input', () => {
            charCount.textContent = bio.value.length;
        })
    }
});
/*API Endpoints*/

const post = async () => {
    try {
        const content = document.getElementById('post-content').value;
        if (!content) {
            alert('Post content cannot be empty!');
            return;
        }
        const response = await fetch('/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                content: content
            })
        });
        const data = await response.json();
        if (response.ok) {
            document.querySelector('#content').value = '';
            alert(data.message);
            window.location.reload();
        } else {
            alert(`Error: ${data.error}`)
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to submit post. Check console for details.');
    }
}

const editPost = async (postId, updatedContent) => {
    try {
        const response = await fetch(`/post/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
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

const toggleLikePost = async (postId, isLiked) => {
    try {
        // determine correct method and endpoint
        const method = isLiked ? 'DELETE' : 'POST';
        const endpoint = isLiked ? `/post/${postId}/unlike` : `/post/${postId}/like`;
        const response = await fetch(endpoint, {
            method: method,
            headers: {
                'X-CSRFToken': csrfToken
            }
        });
        const data = await response.json();
        if (response.ok) {
            return {
                success: true,
                message: data.message,
                isLiked: data.is_liked,
                likeCount: data.like_count
            }
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error: error.message };
    }
}

const comment = async (postId, content) => {
    try {
        const response = await fetch(`/post/${postId}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                content: content
            })
        });
        const data = await response.json();
        if (response.ok) {
            return { success: true, comment: data.comment };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.log('Error:', error);
        return { success: false, error: 'Failed to post comment' };
    }
}

const commentReply = async (commentId, text) => {
    try {
        const response = await fetch(`post/${commentId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                text: text
            })
        })
        const data = await response.json();
        if (response.ok) {
            return { success: true, commentReply: data.comment_reply };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('Error:', error)
        return { success: false, error: 'Failed to post reply' };
    }
}

const toggleLikeComment = async (commentId, isLiked) => {
    try {
        // determine correct method and endpoint
        const method = isLiked ? 'DELETE' : 'POST';
        const endpoint = isLiked ? `comment/${commentId}/unlike` : `comment/${commentId}/like`;
        const response = await fetch(endpoint, {
            method: method,
            headers: {
                'X-CSRFToken': csrfToken
            }
        });
        const data = await response.json();
        if (response.ok) {
            return {
                success: true,
                message: data.message,
                isLiked: data.is_liked,
                likeCount: data.like_count
            }
        } else {
            return {
                success: false,
                error: data.error
            }
        }
    } catch (error) {
        console.error('Error', error);
        return { success: false, error: error.message }
    }
}

const toggleFollow = async (username, isFollowing) => {
    try {
        const method = isFollowing ? 'DELETE' : 'POST';
        const endpoint = isFollowing ? `/profile/${username}/unfollow` : `/profile/${username}/follow`;
        const response = await fetch(endpoint, {
            method: method,
            headers: {
                'X-CSRFToken': csrfToken
            }
        });
        const data = await response.json();
        if (response.ok) {
            return {
                success: true,
                message: data.message,
                following: data.following,
                followerCount: data.follower_count
            };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error: error.message };
    }
}