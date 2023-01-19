// Waveforme html.tsx (Server)
// Copyright (C) 2023 Reese Norris - All Rights Reserved

// Provide HTML template for SSR

import { Stats } from '../types';
import { Config } from '../config';

const html = (content: string, stats: Stats, config: Config) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
    <meta name="theme-color" content="${config.app.THEME_COLOR}" />
    <title>${config.app.TITLE}</title>
    <link rel="manifest" href="${config.app.PUBLIC_URL}/manifest.json" />
    <link rel="shortcut icon" href="${config.app.PUBLIC_URL}/favicon.ico" />
    ${stats.styles.map(filename => `<link rel="stylesheet" href="${config.app.DIST_URL}/${filename}" />`).join('\n')}
    <script id="config-server-side">
      window.__CONFIG__ = ${JSON.stringify(config)};
    </script>
  </head>
  <body>
    <div id="root">${content}</div>
    ${stats.scripts.map(filename => `<script src="${config.app.DIST_URL}/${filename}" crossorigin></script>`).join('\n')}
  </body>
</html>`

export default html;