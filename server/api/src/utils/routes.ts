import Elysia from "elysia";

const routes = new Elysia()
    .get("/", () => "Server is up and running 🦊", {detail: {tags: ['Server Status']}})

export default routes 