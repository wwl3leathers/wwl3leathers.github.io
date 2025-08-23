// Save comment to localStorage
function addComment() {
  const commentBox = document.getElementById("commentBox");
  const comment = commentBox.value.trim();

  if (comment) {
    let comments = JSON.parse(localStorage.getItem("comments")) || [];
    comments.push(comment);
    localStorage.setItem("comments", JSON.stringify(comments));
    displayComments();
    commentBox.value = "";
  }
}

// Show comments on page
function displayComments() {
  const comments = JSON.parse(localStorage.getItem("comments")) || [];
  const commentsDiv = document.getElementById("comments");
  commentsDiv.innerHTML = "";

  comments.forEach((c, i) => {
    const p = document.createElement("p");
    p.textContent = c;
    commentsDiv.appendChild(p);
  });
}

// Load comments when page opens
window.onload = displayComments;
