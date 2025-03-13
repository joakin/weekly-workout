import "./index.res.mjs";

if (process.env.NODE_ENV === "development") {
    // Add live reload for development
    // This will automatically reload the page when files are changed
    new EventSource("/esbuild").addEventListener("change", () =>
        location.reload()
    );
}
