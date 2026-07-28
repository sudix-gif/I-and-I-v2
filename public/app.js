// =====================
// LOGIN
// =====================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

  loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/login", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        username,
        password
      })

    });

    const data = await response.json();

    document.getElementById("message").innerText =
      data.message;

    if (data.success) {

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      window.location.href = "/dashboard.html";

    }

  });

}


// =====================
// LOAD POSTS
// =====================

async function loadPosts() {

  const postsContainer =
    document.getElementById("posts");

  if (!postsContainer) return;

  const response =
    await fetch("/posts");

  const posts =
    await response.json();

  postsContainer.innerHTML = "";

  posts.forEach(post => {

    let media = "";

    if (post.type === "photo") {

      media = `
      <img
      src="/uploads/${post.filename}"
      style="width:100%;border-radius:10px;">
      `;

    }

    else if (post.type === "video") {

      media = `
      <video controls style="width:100%;">
      <source src="/uploads/${post.filename}">
      </video>
      `;

    }

    else if (post.type === "audio") {

      media = `
      <audio controls>
      <source src="/uploads/${post.filename}">
      </audio>
      `;

    }

    else {

      media = `
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      `;

    }

    postsContainer.innerHTML += `

    <div class="post">

      ${media}

      <p>
      ❤️
      <span id="likes-${post.id}">
      ${post.likes || 0}
      </span>
      Likes
      </p>

      <button
      onclick="likePost(${post.id})">
      👍 Like
      </button>

      <br><br>

      <input
      id="comment-${post.id}"
      placeholder="Write comment">

      <button
      onclick="addComment(${post.id})">
      💬 Comment
      </button>

      <div
      id="comments-${post.id}">
      </div>

      <hr>

    </div>

    `;

  });

}

loadPosts();
// =====================
// LIKE POST
// =====================

async function likePost(id) {

  const response = await fetch("/post/" + id + "/like", {
    method: "POST"
  });

  const data = await response.json();

  if (data.success) {

    document.getElementById("likes-" + id).innerText =
      data.likes;

  }

}


// =====================
// COMMENT
// =====================

async function addComment(id) {

  const input =
    document.getElementById("comment-" + id);

  if (!input.value.trim()) return;

  const response = await fetch(
    "/post/" + id + "/comment",
    {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        comment: input.value
      })

    }
  );

  const data = await response.json();

  if (data.success) {

    input.value = "";

    showComments(id, data.comments);

  }

}


// =====================
// SHOW COMMENTS
// =====================

function showComments(id, comments) {

  const container =
    document.getElementById("comments-" + id);

  container.innerHTML = "";

  comments.forEach(comment => {

    container.innerHTML += `
      <p>💬 ${comment.text}</p>
    `;

  });

}


// =====================
// USER INFO
// =====================

const user = JSON.parse(
  localStorage.getItem("user")
);

if (user) {

  const welcome =
    document.getElementById("welcome");

  if (welcome) {
    welcome.innerText =
      "Welcome " + user.username;
  }

  const subscription =
    document.getElementById("subscription");

  if (subscription) {
    subscription.innerText =
      "Subscription: " +
      user.subscription;
  }

}


// =====================
// LOGOUT
// =====================

function logout() {

  localStorage.removeItem("user");

  window.location.href = "/login.html";

}
async function submitTopic() {

  const user =
    JSON.parse(localStorage.getItem("user"));

  if (!user) return;

  const topic =
    document.getElementById("topic").value;

  if (!topic.trim()) return;

  const response =
    await fetch("/topics", {

      method: "POST",

      headers: {
        "Content-Type":"application/json"
      },

      body: JSON.stringify({

        username: user.username,

        topic

      })

    });

  const data =
    await response.json();

  alert(data.message);

  document.getElementById("topic").value = "";

}
