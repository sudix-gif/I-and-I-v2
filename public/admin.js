// =========================
// ADMIN VARIABLES
// =========================

let editingPostId = null;

const form = document.getElementById("postForm");

// =========================
// PUBLISH / UPDATE POST
// =========================

if (form) {

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const username =
      document.getElementById("username").value;

    const password =
      document.getElementById("password").value;

    const type =
      document.getElementById("type").value;

    const title =
      document.getElementById("title").value;

    const content =
      document.getElementById("content").value;

    let url = "/admin/post";
    let method = "POST";

    if (editingPostId) {
      url = "/admin/post/" + editingPostId;
      method = "PUT";
    }

    const response = await fetch(url, {

      method,

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        username,
        password,
        type,
        title,
        content

      })

    });

    const data = await response.json();

    document.getElementById("message").innerText =
      data.message;

    if (data.success) {

      form.reset();

      editingPostId = null;

      document.getElementById("submitBtn").innerText =
        "Publish";

      loadPosts();

    }

  });

}
// =========================
// LOAD POSTS
// =========================

async function loadPosts() {

  const response =
    await fetch("/posts");

  const posts =
    await response.json();

  const container =
    document.getElementById("adminPosts");

  container.innerHTML = "";

  posts.forEach(post => {

    let media = "";

    if (post.type === "photo") {

      media =
      `<img src="/uploads/${post.filename}"
      style="width:100%">`;

    }

    else if (post.type === "video") {

      media =
      `<video controls style="width:100%">
      <source src="/uploads/${post.filename}">
      </video>`;

    }

    else if (post.type === "audio") {

      media =
      `<audio controls>
      <source src="/uploads/${post.filename}">
      </audio>`;

    }

    else {

      media =
      `<h3>${post.title}</h3>
      <p>${post.content}</p>`;

    }

    container.innerHTML += `

    <div class="post">

      ${media}

      <br><br>

      <button
      onclick="editPost(${post.id})">

      ✏ Edit

      </button>

      <button
      onclick="deletePost(${post.id})">

      🗑 Delete

      </button>

      <hr>

    </div>

    `;

  });

}
// =========================
// EDIT POST
// =========================

async function editPost(id) {

  const response = await fetch("/posts");

  const posts = await response.json();

  const post = posts.find(p => p.id === id);

  if (!post) return;

  document.getElementById("type").value =
    post.type || "text";

  document.getElementById("title").value =
    post.title || "";

  document.getElementById("content").value =
    post.content || "";

  editingPostId = id;

  document.getElementById("submitBtn").innerText =
    "Update Post";

}


// =========================
// DELETE POST
// =========================

async function deletePost(id) {

  if (!confirm("Delete this post?")) return;

  const response = await fetch(
    "/admin/post/" + id,
    {
      method: "DELETE"
    }
  );

  const data = await response.json();

  alert(data.message);

  loadPosts();

}
// =========================
// DELETE USER
// =========================

async function deleteUser(id) {

  if (!confirm("Delete user?")) return;

  const response = await fetch(
    "/admin/user/" + id,
    {
      method: "DELETE"
    }
  );

  const data = await response.json();

  alert(data.message);

  loadUsers();

}


// =========================
// BAN / UNBAN USER
// =========================

async function toggleBan(id) {

  const response = await fetch(
    "/admin/user/" + id + "/ban",
    {
      method: "PUT"
    }
  );

  const data = await response.json();

  if (data.success) {

    loadUsers();

  } else {

    alert(data.message);

  }

}
