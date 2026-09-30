const API_BASE = "/api";

async function apiGet(path) {
    const res = await fetch(API_BASE + path);
    if (!res.ok) throw new Error("GET " + path + " failed: " + res.status);
    return res.json();
}

async function apiPost(path, body) {
    const res = await fetch(API_BASE + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error("POST " + path + " failed: " + res.status);
    return res.json();
}

async function apiPut(path) {
    const res = await fetch(API_BASE + path, { method: "PUT" });
    if (!res.ok) throw new Error("PUT " + path + " failed: " + res.status);
    return res.json();
}

// Remembers "who you are" in this browser tab for demo purposes (no login system yet)
function getCurrentUserId() {
    let id = localStorage.getItem("demoUserId");
    if (!id) {
        id = prompt("Enter your user_id (from the users table) to act as:");
        localStorage.setItem("demoUserId", id);
    }
    return id;
}