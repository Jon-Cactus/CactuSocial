let csrfToken;

document.addEventListener('DOMContentLoaded', function() {
    csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    
});

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
            document.getElementById('post-content').value = '';
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
        const response = await fetch(`/post/${commentId}/reply`, {
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
        const endpoint = isLiked ? `/comment/${commentId}/unlike` : `/comment/${commentId}/like`;
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
