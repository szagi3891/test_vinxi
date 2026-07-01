import { renderToPipeableStream } from "react-dom/server";
import { eventHandler } from "vinxi/http";
import { getManifest } from "vinxi/manifest";
import App from "./App";

export default eventHandler(async (event) => {
  const clientManifest = getManifest("client");
  const clientHandler = clientManifest.inputs[clientManifest.handler];
  const scriptSrc = clientHandler.output.path;
  const serverRenderedAt = new Date().toISOString();
  const manifestJson = await clientManifest.json();

  const stream = await new Promise<
    ReturnType<typeof renderToPipeableStream>
  >((resolve) => {
    const pipeableStream = renderToPipeableStream(
      <App serverRenderedAt={serverRenderedAt} />,
      {
        onShellReady() {
          resolve(pipeableStream);
        },
        bootstrapModules: [scriptSrc],
        bootstrapScriptContent: `window.manifest = ${JSON.stringify(manifestJson)}`,
      },
    );
  });

  event.node.res.setHeader("Content-Type", "text/html");
  return stream;
});
