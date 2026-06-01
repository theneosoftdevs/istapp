// src/lib/api.ts

export async function fetchExternalUsers() {
  const res = await fetch("https://jsonplaceholder.typicode.com/users")
  if (!res.ok) throw new Error("Failed to fetch users")
  return res.json()
}

export async function fetchExternalPosts() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts")
  if (!res.ok) throw new Error("Failed to fetch posts")
  return res.json()
}
