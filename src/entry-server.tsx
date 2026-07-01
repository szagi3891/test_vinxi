import { renderToPipeableStream } from "react-dom/server";
import { eventHandler } from "vinxi/http";
import { getManifest } from "vinxi/manifest";
import App from "./App";

export default eventHandler(async (event) => {
  const client = getManifest("client");
  const scriptSrc = client.inputs[client.handler].output.path;
  const manifestJson = await client.json();

  event.node.res.setHeader("Content-Type", "text/html");

  return new Promise((resolve) => {
    const stream = renderToPipeableStream(
      <App serverRenderedAt={new Date().toISOString()} />,
      {
        bootstrapModules: [scriptSrc],
        bootstrapScriptContent: `window.manifest = ${JSON.stringify(manifestJson)}`,
        onShellReady() {
          resolve(stream);
        },
      },
    );
  });
});
