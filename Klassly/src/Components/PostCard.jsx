import React from 'react';
import CommentList from './CommentList';
import CreateCommentForm from './CreateCommentForm';

const PostCard = ({ post, currentUserRole, currentUserId, onAddComment, onLikeComment, onLikePost, replyingTo, setReplyingTo }) => {
  const hasLikedPost = post.likedBy.includes(currentUserId);

  return (
    // This component ONLY renders a single post and its comments.
    // It does NOT have a "View Class Info" button.
    <article style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
      <header style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        <strong>{post.user.name}</strong>
        <span style={{ float: 'right', color: '#888', fontSize: '0.8em' }}>
          {new Date(post.timestamp).toLocaleString()}
        </span>
      </header>
      <p style={{ margin: '0 0 1rem 0' }}>{post.content}</p>
      
      {/* Like Button for the Post */}
      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={() => onLikePost(post.id)}
          style={{ padding: '4px 8px', fontSize: '0.9em', border: 'none', background: 'none', color: hasLikedPost ? '#e0245e' : '#657786', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Like {post.likes > 0 && `(${post.likes})`}
        </button>
      </div>
      
      <section>
        <h4>Comments</h4>
        <CommentList
          comments={post.comments}
          onAddComment={onAddComment}
          onLikeComment={onLikeComment}
          postId={post.id}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          currentUserId={currentUserId}
        />

        {!replyingTo && (
          <CreateCommentForm
            onSubmitComment={(content) => onAddComment(post.id, null, content)}
          />
        )}
      </section>
    </article>
  );
};

export default PostCard;