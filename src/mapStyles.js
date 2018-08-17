import config from './config';
import fs from 'react-native-fs';
import StaticServer from 'react-native-static-server';


let styleLoaded = false;
const PORT = 8004;

export default {
  getBasemapStyle: async function(component) {
    console.log('getBasemapStyle');

    if (styleLoaded) {
      component.setState({ styleLoaded: true });
      return;
    }

    const onError = (error) => {
      console.error(error.message);
    }

    let response;
    try {
      response = await fetch(config.urls.terrainStyleFile);
    } catch (error) {
      response = { error };
      onError(error);
    }

    if (!response || !response.ok) {
      onError(response.error);
    } else {
      let style = await response.json();

      // replace relative URLs with absolute since mapbox doesn't support them
      style.sprite = style.sprite.replace('..', `${config.urls.baseMapTiles}/resources`);
      style.glyphs = style.glyphs.replace('..', `${config.urls.baseMapTiles}/resources`);
      style.sources.esri.tiles[0] = style.sources.esri.tiles[0].replace('../..', `${config.urls.baseMapTiles}`);
      console.log(style);

      try {
        const exists = await fs.exists(this.styleFileURI);
        if (exists) {
          await fs.unlink(this.styleFileURI);
        }

        await fs.writeFile(`file://${fs.DocumentDirectoryPath}/style.json`, JSON.stringify(style));

        styleLoaded = true;
      }
      catch (error) {
        onError(error);
      }
    }

    // mapbox requires http(s) protocal for offline functionality so we have to spin up a server
    const server = new StaticServer(PORT, fs.DocumentDirectoryPath, {localOnly: true});
    server.start();

    component.setState({ styleLoaded: true });
  },
  styleFileURI: `http://localhost:${PORT}/style.json`
}
