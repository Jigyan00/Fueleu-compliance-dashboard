import { createApp } from "./app";

const app = createApp();
const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
});
