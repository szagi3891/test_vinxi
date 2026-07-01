import { renderToString } from "react-dom/server";
import { eventHandler } from "vinxi/http";
import { getManifest } from "vinxi/manifest";
import App from "./App";

export default eventHandler(async (event) => {
  const client = getManifest("client");
  const scriptSrc = client.inputs[client.handler].output.path;

  const html =
    "<!DOCTYPE html>" +
    renderToString(<App serverRenderedAt={new Date().toISOString()} />).replace(
      "</body>",
      `<script type="module" src="${scriptSrc}"></script></body>`,
    );

  event.node.res.setHeader("Content-Type", "text/html");
  return html;
});
